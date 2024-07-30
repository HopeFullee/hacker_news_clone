const ajax = new XMLHttpRequest();

ajax.open("GET", "https://api.hnpwa.com/v0/news/1.json", false);
ajax.send();

const res = ajax.response;
const newsFeed = JSON.parse(res);

const ul = document.createElement("ul");

const titleList = newsFeed.forEach(({ title }, idx) => {
  const li = document.createElement("li");

  li.innerHTML = title;
  ul.appendChild(li);
});

document.getElementById("root").appendChild(ul);
