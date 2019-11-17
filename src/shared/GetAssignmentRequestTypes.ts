export interface GetAssignmentRequestData {
  requestName: "REQUEST_GET_ASSIGNMENT";
  judgeId: number;
}

export interface GetAssignmentResponseData {
  id: number;
  judgeId: number;
  assignmentType: number;

  ratingAssignment?: RatingAssignment;
  rankingAssignment?: RankingAssignment;
}

export interface RatingAssignment {
  submissionId: number;
  submissionName: string;
  submissionLocation: number;
  categories: Array<{id: number, name: string}>;
}

export interface RankingAssignment {
  prizeId: number;
  prizeName: string;
  submissions: Array<{id: number, name: string, location: number}>;
}
