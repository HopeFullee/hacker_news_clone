import View from "../core/view";

export interface StoreType {
  currentPage: number;
  feeds: NewsFeed[];
}

export interface News {
  id: number;
  title: string;
  time: number;
  time_ago: string;
  url: string;
  user: string;
  type: "link" | "comment";
  content: string;
}

export interface NewsFeed extends News {
  comments_count: number;
  points: number;
  domain: string;
  read?: boolean;
}

export interface NewsDetail extends News {
  points: number;
  comments: NewsComments[];
}

export interface NewsComments extends News {
  comments: NewsComments[];
  comments_count: number;
  level: number;
}

export interface RouteInfo {
  path: string;
  page: View;
}
