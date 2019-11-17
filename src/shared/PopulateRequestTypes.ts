import {isArray} from "./util";
import {MAX_LOCATION} from "./constants";

export interface PopulateRequestData {
  requestName: "REQUEST_POPULATE";
  submissions: Array<{name: string, location: number}>;
  judges: Array<{name: string}>;
  categories: Array<{name: string}>;
  prizes: Array<{name: string}>;
  submissionPrizes: Array<{submission: number, prize: number}>;
}
