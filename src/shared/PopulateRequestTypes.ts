import {isArray} from "./util";

export interface PopulateRequestData {
  requestName: "REQUEST_POPULATE";
  submissions: Array<{name: string, location: number}>;
  judges: Array<{name: string}>;
  categories: Array<{name: string}>;
  prizes: Array<{name: string}>;
  submissionPrizes: Array<{submission: number, prize: number}>;
}

export function checkPopulateRequestData(data: any): boolean {
  if (
    typeof data !== "object" ||
    data.requestName !== "REQUEST_POPULATE" ||
    !isArray(data.submissions) ||
    !isArray(data.judges) ||
    !isArray(data.categories) ||
    !isArray(data.prizes) ||
    !isArray(data.submissionPrizes)
  ) {
    return false;
  }

  for (let submission of data.submissions) {
    if (
      typeof submission.name !== "string" ||
      typeof submission.location !== "number"
    ) {
      return false;
    }
  }

  for (let judge of data.judges) {
    if (typeof judge.name !== "string") {
      return false;
    }
  }

  for (let category of data.categories) {
    if (typeof category.name !== "string") {
      return false;
    }
  }

  for (let prize of data.prizes) {
    if (typeof prize.name !== "string") {
      return false;
    }
  }

  for (let submissionPrize of data.submissionPrizes) {
    if (
      typeof submissionPrize.submission !== "number" ||
      typeof submissionPrize.prize !== "number"
    ) {
      return false;
    }
  }

  return true;
}
