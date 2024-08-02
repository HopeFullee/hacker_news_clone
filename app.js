const rootContainer = document.getElementById("root");

const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const NEWS_CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

const store = {
  currentPage: 1,
};

const getData = (url) => {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
};

const newsFeed = () => {
  const newsFeed = getData(NEWS_URL);

  let template = `
    <div class="max-w-[1200px] mx-auto pt-[100px]">
      <h1>Hacker News</h1>
      <ul>
        {{__news_feed__}}
      </ul>
      <div>
        <a href="#/page/{{__prev_page__}}">이전 페이지</a>
        <a href="#/page/{{__next_page__}}">다음 페이지</a>
      </div>
    </div>
  `;

  const newsList = newsFeed.map(({ id, title, comments_count }, idx) => {
    if (idx + 1 > (store.currentPage - 1) * 10 && idx < store.currentPage * 10)
      return `
          <li>
            <a href="#/news/${id}">${title} (${comments_count})</a>
          </li>
        `;
  });

  template = template.replace("{{__news_feed__}}", newsList.join(""));
  template = template.replace(
    "{{__prev_page__}}",
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace(
    "{{__next_page__}}",
    store.currentPage < newsFeed.length / 10
      ? store.currentPage + 1
      : newsFeed.length / 10
  );

  rootContainer.innerHTML = template;
};

const newsDetail = () => {
  const id = location.hash.replace("#/news/", "");

  const newsContent = getData(NEWS_CONTENT_URL.replace("@id", id));

  rootContainer.innerHTML = `
    <h1>${newsContent ? newsContent.title : "게시글이 없습니다"}</h1>
    <div>
      <a href='#/page/${store.currentPage}'>목록으로</a>
    </div>
  `;
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
