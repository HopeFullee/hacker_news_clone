import View from "../core/view";
import { NewsDetailApi } from "../core/api";
import { NEWS_CONTENT_URL } from "../config";
import { NewsComments, NewsStore } from "../types";

const template = `
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

export class NewsDetailView extends View {
  private store: NewsStore;

  constructor(containerId: string, store: NewsStore) {
    super(containerId, template);

    this.store = store;
  }

  render() {
    const id = location.hash.replace("#/news/", "");
    const api = new NewsDetailApi(NEWS_CONTENT_URL.replace("@id", id));
    const newsContent = api.getData();

    this.store.makeRead(Number(id));
    this.setTemplateData("comments", this.displayComment(newsContent.comments));
    this.setTemplateData("currentPage", this.store.currentPage.toString());
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
