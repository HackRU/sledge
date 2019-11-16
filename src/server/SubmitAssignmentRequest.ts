import {Database} from "./Database";
import {
  RequestHandler,
  RequestValidationError,
  ResponseObject
} from "./Request";
import {
  ASSIGNMENT_TYPE_RATING,
  ASSIGNMENT_TYPE_RANKING
} from "../shared/constants";
import * as tc from "./TypeCheck";
import {
  RatingAssignmentForm,
  RankingAssignmentForm,
  SubmitAssignmentRequestData
} from "../shared/SubmitAssignmentRequestTypes";

const validator = tc.hasShape({
  requestName: tc.isConstant("REQUEST_SUBMIT_ASSIGNMENT"),
  assignmentId: tc.isId,

  ratingAssignmentForm: tc.isOptional(tc.hasShape({
    noShow: tc.isBoolean,
    rating: tc.isInteger,
    categoryRatings: tc.isArrayOf(tc.isInteger)
  })),
  rankingAssignmentForm: tc.isOptional(tc.hasShape({
    topSubmissionIds: tc.isFixedLengthArrayOf(tc.isId, 3)
  }))
});

export class SubmitAssignmentRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_SUBMIT_ASSIGNMENT";
  }

  simpleValidate(data: any): boolean {
    return validator(data);
  }

  handleSync(data: any): ResponseObject {
    const requestData = data as SubmitAssignmentRequestData;

    this.db.begin();

    const assignment = this.db.prepare(
      "SELECT id, type, active FROM Assignment WHERE id=?;"
    ).get(requestData.assignmentId);

    if (!assignment.active) {
      this.db.rollback();
      return { error: "Submitted assignment is not active" };
    }

    if (assignment.type === ASSIGNMENT_TYPE_RATING) {
      if (!requestData.ratingAssignmentForm) {
        this.db.rollback();
        return { error: "Incorrect submission for rating assignment" };
      }

      this.submitRatingAssignment(requestData.assignmentId, requestData.ratingAssignmentForm);
    } else if (assignment.type === ASSIGNMENT_TYPE_RANKING) {
      if (!requestData.rankingAssignmentForm) {
        this.db.rollback();
        return { error: "Incorrect submission for ranking assignment" };
      }

      this.submitRankingAssignment(requestData.assignmentId, requestData.rankingAssignmentForm);
    }

    this.db.prepare(
      "UPDATE Assignment SET active=0 WHERE id=?;"
    ).run(assignment.id);

    this.db.commit();

    return {
      success: true
    };
  }

  submitRatingAssignment(assignmentId: number, form: RatingAssignmentForm) {
    const ratingAssignment = this.db.prepare(
      "SELECT id FROM RatingAssignment WHERE assignmentId=?;"
    ).get(assignmentId);
    const categories = this.db.prepare(
      "SELECT Category.id AS id FROM Category "+
        "LEFT JOIN Assignment ON Assignment.id=? "+
        "LEFT JOIN RatingAssignment ON assignmentId=Assignment.id "+
        "LEFT JOIN Submission ON submissionId=Submission.id "+
        "WHERE Category.trackId=Submission.trackId "+
        "ORDER BY id;"
    ).all(assignmentId);

    for (let i=0;i<categories.length;i++) {
      this.db.prepare(
        "INSERT INTO Rating(ratingAssignmentId, categoryId, score) "+
          "VALUES(?, ?, ?);"
      ).run(ratingAssignment.id, categories[i].id, form.categoryRatings[i]);
    }

    this.db.prepare(
      "UPDATE RatingAssignment SET noShow=?,rating=? WHERE id=?;"
    ).run(form.noShow ? 1 : 0, form.rating, ratingAssignment.id);
  }

  submitRankingAssignment(assignmentId: number, form: RankingAssignmentForm) {
    const rankingAssignment = this.db.prepare(
      "SELECT id AS rankingAssignmentId "+
        "FROM RankingAssignment "+
        "WHERE assignmentId=?;"
    ).get(assignmentId);
    const updateRankStmt = this.db.prepare(
      "UPDATE Ranking SET rank=?, score=? WHERE rankingAssignmentId=? AND submissionId=?;"
    );
    updateRankStmt.run(1, 4, rankingAssignment.rankingAssignmentId, form.topSubmissionIds[0]);
    updateRankStmt.run(2, 2, rankingAssignment.rankingAssignmentId, form.topSubmissionIds[1]);
    updateRankStmt.run(3, 1, rankingAssignment.rankingAssignmentId, form.topSubmissionIds[2]);
  }
}
