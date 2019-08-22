import {BadRouteApp} from "./apps/BadRouteApp";
import {DebugApp} from "./apps/DebugApp";
import {PopulateApp} from "./apps/PopulateApp";
import {DevpostApp} from "./apps/DevpostApp";
import {LoginApp} from "./apps/LoginApp";
import {JudgeApp} from "./apps/JudgeApp";
import {VisualizeRatingsApp} from "./apps/VisualizeRatingsApp";

export interface PageListing {
  match: RegExp;
  canonical: string;
  component: any;
};

export const pages: Array<PageListing> = [{
  match: /^#debug($|\/)/,
  canonical: "#debug",
  component: DebugApp
}, {
  match: /^#populate(\/|$)/,
  canonical: "#populate",
  component: PopulateApp
}, {
  match: /^#devpost(\/|$)/,
  canonical: "#devpost",
  component: DevpostApp
}, {
  match: /^#login(\/|$)/,
  canonical: "#login",
  component: LoginApp,
}, {
  match: /^#judge(\/|$)/,
  canonical: "#judge",
  component: JudgeApp
}, {
  match: /^#visualizeRatings(\/|$)/,
  canonical: "#visualizeRatings",
  component: VisualizeRatingsApp
}, {
  // Default
  match: /.*/,
  canonical: "#error",
  component: BadRouteApp
}];
