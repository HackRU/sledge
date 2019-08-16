import {BadRouteApp} from "./apps/BadRouteApp";
import {DebugApp} from "./apps/DebugApp";
import {PopulateApp} from "./apps/PopulateApp";
import {DevpostApp} from "./apps/DevpostApp";
import {LoginApp} from "./apps/LoginApp";

export interface PageListing {
  match: RegExp;
  canonical: string;
  component: any;
};

export const pages: Array<PageListing> = [{
  match: /^#admin\/debug$/,
  canonical: "#admin/debug",
  component: DebugApp
}, {
  match: /^#setup\/populate(\/|$)/,
  canonical: "#setup/populate",
  component: PopulateApp
}, {
  match: /^#setup\/devpost(\/|$)/,
  canonical: "#setup/devpost",
  component: DevpostApp
}, {
  match: /^#judge\/login(\/|$)/,
  canonical: "#judge/login",
  component: LoginApp,
}, {
  // Default
  match: /.*/,
  canonical: "#error",
  component: BadRouteApp
}];
