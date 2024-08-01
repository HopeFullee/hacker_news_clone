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

  rootContainer.innerHTML = `
  <ul>
    ${newsFeed
      .map(({ id, title, comments_count }, idx) => {
        if (
          idx + 1 > (store.currentPage - 1) * 10 &&
          idx < store.currentPage * 10
        )
          return `
        <li>
          <a href="#/news/${id}">${title} (${comments_count})</a>
        </li>
        `;
      })
      .join("")}
  </ul>
  <div>
      <a href='#/page/${
        store.currentPage > 1 ? store.currentPage - 1 : 1
      }'>이전 페이지</a>
      <a href='#/page/${
        store.currentPage < newsFeed.length / 10
          ? store.currentPage + 1
          : newsFeed.length / 10
      }'>다음 페이지</a>
  </div>
`;
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
