interface StoreType {
  currentPage: number;
  feeds: NewsFeed[];
}

type News = {
  id: number;
  title: string;
  time: number;
  time_ago: string;
  url: string;
  user: string;
  type: "link" | "comment";
  content: string;
};

type NewsFeed = {
  comments_count: number;
  points: number;
  domain: string;
  read?: boolean;
} & News;

type NewsDetail = {
  points: number;
  comments: NewsComments[];
} & News;

type NewsComments = {
  comments: NewsComments[];
  comments_count: number;
  level: number;
} & News;

const rootContainer = document.getElementById("root");
const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const NEWS_CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

const store: StoreType = {
  currentPage: 1,
  feeds: [],
};

const getData = <AjaxResponse>(url: string): AjaxResponse => {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
};

const createFeed = (newsData: NewsFeed[]) => {
  newsData.forEach((feeds) => {
    feeds.read = false;
  });

  return newsData;
};

const updateView = (html: string) => {
  if (rootContainer) rootContainer.innerHTML = html;
};

const newsFeed = () => {
  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}        
      </div>
    </div>
  `;

  if (store.feeds.length === 0) {
    store.feeds = createFeed(getData<NewsFeed[]>(NEWS_URL));
  }

  const newsList = store.feeds.map(
    ({ id, title, user, points, time_ago, comments_count, read }, idx) => {
      if (
        idx + 1 > (store.currentPage - 1) * 10 &&
        idx < store.currentPage * 10
      )
        return `
          <div class="p-6 ${
            read ? "bg-green-500" : "bg-white"
          } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
              <div class="flex-auto">
                <a href="#/news/${id}">${title}</a>  
              </div>
              <div class="text-center text-sm">
                <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
              </div>
            </div>
            <div class="flex mt-3">
              <div class="grid grid-cols-3 text-sm text-gray-500">
                <div><i class="fas fa-user mr-1"></i>${user}</div>
                <div><i class="fas fa-heart mr-1"></i>${points}</div>
                <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
              </div>  
            </div>
          </div>    
        `;
    }
  );

  template = template.replace("{{__news_feed__}}", newsList.join(""));
  template = template.replace(
    "{{__prev_page__}}",
    (store.currentPage > 1 ? store.currentPage - 1 : 1).toString()
  );
  template = template.replace(
    "{{__next_page__}}",
    (store.currentPage < store.feeds.length / 10
      ? store.currentPage + 1
      : store.feeds.length / 10
    ).toString()
  );

  updateView(template);
};

const newsDetail = () => {
  const id = location.hash.replace("#/news/", "");
  const newsContent = getData<NewsDetail>(NEWS_CONTENT_URL.replace("@id", id));

  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>
        {{__comments__}}
      </div>
    </div>
  `;

  store.feeds.forEach((feeds) => {
    if (feeds.id === Number(id)) {
      feeds.read = true;
    }
  });

  template = template.replace(
    "{{__comments__}}",
    displayComment(newsContent.comments)
  );

  updateView(template);
};

const displayComment = (comments: NewsComments[]) => {
  const commentList: string[] = [];

  comments.forEach(({ user, time_ago, content, comments, level }) => {
    commentList.push(`
      <div style="padding-left: ${level * 40}px" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${user}</strong> ${time_ago}
        </div>
        <p class="text-gray-700 break-all">${content}</p>
      </div>  
      `);

    if (comments.length > 0) {
      commentList.push(displayComment(comments));
    }
  });

  return commentList.join("");
};

const router = () => {
  const currHashPath = location.hash;

  if (currHashPath === "") newsFeed();
  else if (currHashPath.indexOf("#/page/") >= 0) {
    store.currentPage = Number(currHashPath.replace("#/page/", ""));
    newsFeed();
  } else newsDetail();
};

window.addEventListener("hashchange", router);

router();
