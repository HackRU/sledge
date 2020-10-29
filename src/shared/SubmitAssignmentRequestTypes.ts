import {isArray} from "./util";

export interface SubmitAssignmentRequestData {
  requestName: "REQUEST_SUBMIT_ASSIGNMENT";
  assignmentId: number;

  ratingAssignmentForm?: RatingAssignmentForm;
  rankingAssignmentForm?: RankingAssignmentForm;
  judgetimer?: number;
}

export interface RatingAssignmentForm {
  noShow: boolean;
  rating: number;
  categoryRatings: Array<number>;
}

export interface RankingAssignmentForm {
  topSubmissionIds: Array<number>;
}
