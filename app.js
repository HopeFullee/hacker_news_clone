const rootContainer = document.getElementById("root");
const contentDiv = document.createElement("div");

const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const NEWS_CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

ajax.open("GET", NEWS_URL, false);
ajax.send();

const res = ajax.response;
const newsFeed = JSON.parse(res);

const ul = document.createElement("ul");

window.addEventListener("hashchange", () => {
  const id = location.hash.substring(1);

  ajax.open("GET", NEWS_CONTENT_URL.replace("@id", id), false);
  ajax.send();

  const newsContent = JSON.parse(ajax.response);
  console.log(newsContent);

  const title = document.createElement("h1");
  title.innerHTML = newsContent.title;

  contentDiv.appendChild(title);
});

const titleList = newsFeed.forEach(({ id, title, comments_count }, idx) => {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.href = `#${id}`;
  a.innerHTML = `${title} (${comments_count})`;

  li.appendChild(a);
  ul.appendChild(li);
});

rootContainer.appendChild(ul);
rootContainer.appendChild(contentDiv);
