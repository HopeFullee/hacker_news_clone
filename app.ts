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

interface NewsFeed extends News {
  comments_count: number;
  points: number;
  domain: string;
  read?: boolean;
}

interface NewsDetail extends News {
  points: number;
  comments: NewsComments[];
}

interface NewsComments extends News {
  comments: NewsComments[];
  comments_count: number;
  level: number;
}

interface RouteInfo {
  path: string;
  page: View;
}

const rootContainer = document.getElementById("root");
const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const NEWS_CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

const store: StoreType = {
  currentPage: 1,
  feeds: [],
};

class Api {
  url: string;
  ajax: XMLHttpRequest;

  constructor(url: string) {
    this.url = url;
    this.ajax = new XMLHttpRequest();
  }

  protected getRequest<AjaxResponse>(): AjaxResponse {
    this.ajax.open("GET", this.url, false);
    this.ajax.send();

    return JSON.parse(this.ajax.response);
  }
}

class NewsFeedApi extends Api {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewsDetailApi extends Api {
  getData(): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}

abstract class View {
  private template: string;
  private renderTemplate: string;
  private container: HTMLElement;
  private htmlList: string[];

  constructor(containerId: string, template: string) {
    const containerEl = document.getElementById(containerId);

    if (!containerEl) throw "최상위 컨테이너가 없어 UI를 진행하지 못합니다.";

    this.container = containerEl;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  protected updateView = () => {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template;
  };

  protected addHtml(htmlString: string) {
    this.htmlList.push(htmlString);
  }

  protected getHtml() {
    const snapshot = this.htmlList.join("");
    this.clearHtmlList();
    return snapshot;
  }

  protected setTemplateData(key: string, val: string) {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, val);
  }

  private clearHtmlList() {
    this.htmlList = [];
  }

  // 하위 자식 클래스가 필수적으로 구현 해야하는 함수 'abstract'
  abstract render(): void;
}

class Router {
  defaultRoute: RouteInfo | null;
  routeTable: RouteInfo[];

  constructor() {
    window.addEventListener("hashchange", this.route.bind(this));

    this.defaultRoute = null;
    this.routeTable = [];
  }

  setDefaultPage(page: View) {
    this.defaultRoute = { path: "", page };
  }

  addRoutePath(path: string, page: View) {
    this.routeTable.push({ path, page });
  }

  route() {
    const currHashPath = location.hash;

    if (currHashPath === "" && this.defaultRoute) {
      this.defaultRoute.page.render();
    }

    for (const routeInfo of this.routeTable) {
      if (currHashPath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render();
        break;
      }
    }
  }
}

class NewsFeedView extends View {
  private api: NewsFeedApi;

  constructor(containerId: string) {
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

    super(containerId, template);
    this.api = new NewsFeedApi(NEWS_URL);

    if (store.feeds.length === 0) {
      store.feeds = this.api.getData();
      this.createFeeds();
    }
  }

  render() {
    store.currentPage = Number(location.hash.replace("#/page/", "") || 1);

    store.feeds.forEach(
      ({ id, title, user, points, time_ago, comments_count, read }, idx) => {
        if (
          idx + 1 > (store.currentPage - 1) * 10 &&
          idx < store.currentPage * 10
        )
          this.addHtml(`
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
        `);
      }
    );

    this.setTemplateData("news_feed", this.getHtml());
    this.setTemplateData(
      "prev_page",
      (store.currentPage > 1 ? store.currentPage - 1 : 1).toString()
    );
    this.setTemplateData(
      "next_page",
      (store.currentPage < store.feeds.length / 10
        ? store.currentPage + 1
        : store.feeds.length / 10
      ).toString()
    );

    this.updateView();
  }

  private createFeeds = () => {
    store.feeds.forEach((feeds) => {
      feeds.read = false;
    });

    return store.feeds;
  };
}

class NewsDetailView extends View {
  constructor(containerId: string) {
    let template = `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/{{__currentPage__}}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
  
        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>{{__title__}}</h2>
          <div class="text-gray-400 h-20">
            {{__content__}}
          </div>
          {{__comments__}}
        </div>
      </div>
    `;

    super(containerId, template);
  }

  render() {
    const id = location.hash.replace("#/news/", "");
    const api = new NewsDetailApi(NEWS_CONTENT_URL.replace("@id", id));
    const newsContent = api.getData();

    store.feeds.forEach((feeds) => {
      if (feeds.id === Number(id)) {
        feeds.read = true;
      }
    });

    this.setTemplateData("comments", this.displayComment(newsContent.comments));
    this.setTemplateData("currentPage", store.currentPage.toString());
    this.setTemplateData("title", newsContent.title);
    this.setTemplateData("content", newsContent.content);

    this.updateView();
  }

  displayComment(comments: NewsComments[]) {
    comments.forEach(({ user, time_ago, content, comments, level }) => {
      this.addHtml(`
        <div style="padding-left: ${level * 40}px" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${user}</strong> ${time_ago}
          </div>
          <p class="text-gray-700 break-all">${content}</p>
        </div>  
        `);

      if (comments.length > 0) {
        this.addHtml(this.displayComment(comments));
      }
    });

    return this.getHtml();
  }
}

const router: Router = new Router();
const newsFeedView = new NewsFeedView("root");
const newsDetailView = new NewsDetailView("root");

router.setDefaultPage(newsFeedView);
router.addRoutePath("/page/", newsFeedView);
router.addRoutePath("/news/", newsDetailView);

router.route();
