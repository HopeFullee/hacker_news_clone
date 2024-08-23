import { NewsFeed, NewsStore } from "../types";

export default class Store implements NewsStore {
  private feeds: NewsFeed[];
  private _currentPage: number;

  constructor() {
    this.feeds = [];
    this._currentPage = 1;
  }

  get currentPage() {
    return this._currentPage;
  }

  set currentPage(page: number) {
    if (page <= 0) return;
    this._currentPage = page;
  }

  get nextPage() {
    return this._currentPage < this.feeds.length / 10
      ? this.currentPage + 1
      : this.feeds.length / 10;
  }

  get prevPage() {
    return this._currentPage > 1 ? this._currentPage - 1 : 1;
  }

  get numberOfFeed() {
    return this.feeds.length;
  }

  get hasFeeds() {
    return this.feeds.length > 0;
  }

  getAllFeeds() {
    return this.feeds;
  }

  getFeed(position: number) {
    return this.feeds[position];
  }

  setFeeds(feeds: NewsFeed[]) {
    this.feeds = feeds.map((feed) => {
      return {
        ...feed,
        read: false,
      };
    });
  }

  makeRead(id: number) {
    const selectedFeed = this.feeds.find((feed: NewsFeed) => feed.id === id);

    if (selectedFeed) {
      selectedFeed.read = true;
    }
  }
}
