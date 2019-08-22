import {isArray} from "./util";

export interface SubmitAssignmentRequestData {
  requestName: "REQUEST_SUBMIT_ASSIGNMENT";
  assignmentId: number;

  ratingAssignmentForm?: RatingAssignmentForm;
}

export interface RatingAssignmentForm {
  noShow: boolean;
  rating: number;
  categoryRatings: Array<number>;
}

export function checkSubmitAssignmentRequestData(data: any): boolean {
  if (
    data["requestName"] !== "REQUEST_SUBMIT_ASSIGNMENT" ||
    typeof data["assignmentId"] !== "number" ||
    !(!data["ratingAssignmentForm"] || checkRatingAssignmentForm(data["ratingAssignmentForm"]))
  ) {
    return false;
  }

  return true;
}

export function checkRatingAssignmentForm(data: any): boolean {
  if (
    typeof data !== "object" ||
    typeof data["noShow"] !== "boolean" ||
    !isArray(data["categoryRatings"])
  ) {
    return false;
  }

  for (let rating of data["categoryRatings"]) {
    if (typeof rating !== "number") {
      return false;
    }
  }

  return true;
}
