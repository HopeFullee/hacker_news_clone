import { RouteInfo } from "../types";
import View from "./view";

export default class Router {
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
