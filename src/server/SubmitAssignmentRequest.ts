import {Database} from "./Database";
import {
  RequestHandler,
  RequestValidationError,
  ResponseObject
} from "./Request";
import {
  ASSIGNMENT_TYPE_RATING,
  ASSIGNMENT_TYPE_RANKING, ASSIGNMENT_STATUS_ACTIVE, ASSIGNMENT_STATUS_COMPLETE
} from "../shared/constants";
import * as tc from "./TypeCheck";
import {
  RatingAssignmentForm,
  RankingAssignmentForm,
  SubmitAssignmentRequestData
} from "../shared/SubmitAssignmentRequestTypes";
import { SuccErr } from "../shared/util";

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

/**
 * Submit an assignment
 */
export class SubmitAssignmentRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_SUBMIT_ASSIGNMENT";
  }

  simpleValidate(data: any): boolean {
    return validator(data);
  }

  handleSync(data: SubmitAssignmentRequestData): ResponseObject {
    const requestData = data as SubmitAssignmentRequestData;

    this.db.begin();

    const assignment = this.db.get<{
      id: number,
      type: number,
      status: number
    }>(
      "SELECT id, type, status FROM Assignment WHERE id=?;",
      data.assignmentId
    );

    if (assignment.status !== ASSIGNMENT_STATUS_ACTIVE) {
      this.db.rollback();
      return { error: "Submitted assignment is not active" };
    }

    let result: SuccErr;
    if (assignment.type === ASSIGNMENT_TYPE_RATING) {
      if (!requestData.ratingAssignmentForm) {
        this.db.rollback();
        return { error: "Incorrect submission for rating assignment" };
      }

      result = this.submitRatingAssignment(requestData.assignmentId, requestData.ratingAssignmentForm);
    } else if (assignment.type === ASSIGNMENT_TYPE_RANKING) {
      if (!requestData.rankingAssignmentForm) {
        this.db.rollback();
        return { error: "Incorrect submission for ranking assignment" };
      }

      result = this.submitRankingAssignment(requestData.assignmentId, requestData.rankingAssignmentForm);
    } else {
      this.db.rollback();
      return {
        error: `Unknown assignment type ${assignment.type}`
      };
    }

    if (!result.success) {
      this.db.rollback();
      return result;
    }

    this.db.run(
      "UPDATE Assignment SET status=? WHERE id=?;",
      [ASSIGNMENT_STATUS_COMPLETE, assignment.id]
    );

    this.db.commit();

    return {
      success: true
    };
  }

  submitRatingAssignment(assignmentId: number, form: RatingAssignmentForm): SuccErr {
    const ratingAssignment = this.db.get<{
      id: number
    }>(
      "SELECT id FROM RatingAssignment WHERE assignmentId=?;",
      assignmentId
    );

    const categories = this.db.all<{
      id: number
    }>(
      "SELECT Category.id AS id FROM Category "+
        "LEFT JOIN Assignment ON Assignment.id=? "+
        "LEFT JOIN RatingAssignment ON assignmentId=Assignment.id "+
        "LEFT JOIN Submission ON submissionId=Submission.id "+
        "WHERE Category.trackId=Submission.trackId "+
        "ORDER BY id;",
        assignmentId
    );

    let score = 0;
    if (!form.noShow) {
      if (form.categoryRatings.length !== categories.length) {
        return {
          success: false,
          error: `Expected ${categories.length} category scores,`+
            `got ${form.categoryRatings.length}`
        }
      }

      this.db.runMany(
        "INSERT INTO Rating(ratingAssignmentId, categoryId, answer) "+
          "VALUES(?, ?, ?);",
        categories.map(
          (c, i) => [ratingAssignment.id, c.id, form.categoryRatings[i]]
        )
      );

      // Calculate the score as the average of all category rankings, normalized to 0-1 scale
      for (let rating of form.categoryRatings) {
        if (rating >= 5) {
          score += 4;
        } else if (rating >= 1) {
          score += (rating - 1) / 4;
        }
      }
      score /= form.categoryRatings.length * 4;
    }

    this.db.run(
      "UPDATE RatingAssignment SET noShow=?, score=? WHERE id=?;",
      [form.noShow ? 1 : 0, score, ratingAssignment.id]
    );

    return {
      success: true
    };
  }

  submitRankingAssignment(assignmentId: number, form: RankingAssignmentForm): SuccErr {
    if (form.topSubmissionIds.length < 1 || form.topSubmissionIds.length > 3) {
      return {
        success: false,
        error: `Got topSubmissionIds of length ${form.topSubmissionIds.length}`
      };
    }

    const rankingAssignment = this.db.get<{
      id: number
    }>(
      "SELECT id FROM RankingAssignment WHERE assignmentId=?;",
      assignmentId
    );

    this.db.runMany(
      "UPDATE Ranking SET rank=?, score=? WHERE rankingAssignmentId=? AND submissionId=?;",
      form.topSubmissionIds.map(
        (submissionId, i) => [i+1, (3-i)/6, rankingAssignment.id, submissionId]
      )
    );

    return {
      success: true
    };
  }
}
