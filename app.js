const rootContainer = document.getElementById("root");
const contentDiv = document.createElement("div");

const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const NEWS_CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

const getData = (url) => {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
};

const newsFeed = getData(NEWS_URL);
const ul = document.createElement("ul");

window.addEventListener("hashchange", () => {
  const id = location.hash.substring(1);

  const newsContent = getData(NEWS_CONTENT_URL.replace("@id", id));
  console.log(newsContent);

  const title = document.createElement("h1");
  title.innerHTML = newsContent.title;

  contentDiv.appendChild(title);
});

newsFeed.forEach(({ id, title, comments_count }, idx) => {
  const div = document.createElement("div");

  div.innerHTML = `
    <li>
      <a href="#${id}">${title} ${comments_count}</a>
    </li>
  `;

  ul.appendChild(div.firstElementChild);
});

rootContainer.appendChild(ul);
rootContainer.appendChild(contentDiv);
