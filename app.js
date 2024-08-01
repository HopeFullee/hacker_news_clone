const rootContainer = document.getElementById("root");

const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const NEWS_CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

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
        return `
        <li>
          <a href="#${id}">${title} ${comments_count}</a>
        </li>
        `;
      })
      .join("")}
  </ul>
`;
};

const newsDetail = () => {
  const id = location.hash.substring(1);

  const newsContent = getData(NEWS_CONTENT_URL.replace("@id", id));

  rootContainer.innerHTML = `
    <h1>${newsContent ? newsContent.title : "게시글이 없습니다"}</h1>
    <div>
      <a href='#'>목록으로</a>
    </div>
  `;
};

const router = () => {
  const currHashPath = location.hash;

  if (currHashPath !== "") newsDetail();
  else newsFeed();
};

window.addEventListener("hashchange", router);

router();
