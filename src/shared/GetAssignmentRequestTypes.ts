export interface GetAssignmentResponseData {
  id: number;
  judgeId: number;
  assignmentType: number;

  ratingAssignment: RatingAssignment;
}

export interface RatingAssignment {
  submissionId: number;
  submissionName: string;
  submissionLocation: number;
  categories: Array<{id: number, name: string}>;
}
