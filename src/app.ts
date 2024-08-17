import { StoreType } from "./types";
import Router from "./core/router";
import { NewsDetailView, NewsFeedView } from "./page";

export const store: StoreType = {
  currentPage: 1,
  feeds: [],
};

const router: Router = new Router();
const newsFeedView = new NewsFeedView("root");
const newsDetailView = new NewsDetailView("root");

router.setDefaultPage(newsFeedView);
router.addRoutePath("/page/", newsFeedView);
router.addRoutePath("/news/", newsDetailView);

router.route();
