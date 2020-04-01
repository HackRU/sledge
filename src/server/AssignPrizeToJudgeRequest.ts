import {RequestHandler} from "./Request";
import {Database} from "./Database";
import {
  AssignPrizeToJudgeRequestData
} from "../shared/AssignPrizeToJudgeRequestTypes";
import * as tc from "./TypeCheck";
import {ASSIGNMENT_STATUS_ACTIVE, ASSIGNMENT_TYPE_RANKING, ASSIGNMENT_TYPE_RATING} from "../shared/constants";

const validator = tc.hasShape({
  judgeId: tc.isId,
  prizeId: tc.isId
});

/**
 * Creates a rating assignment for every submission eligible for a given prize that a judge has not yet rated,
 * and assigns it to that judge. Then, creates a ranking assignment asking the judge to choose their favorite
 * three submissions for that prize.
 */
export class AssignPrizeToJudgeRequest implements RequestHandler {
  constructor (private db: Database) {
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_ASSIGN_PRIZE_TO_JUDGE";
  }

  simpleValidate(data: any) {
    return validator(data);
  }

  handleSync(data: any): object {
    const request: AssignPrizeToJudgeRequestData = data;
    const {prizeId, judgeId} = request;

    this.db.begin();

    // The set of submissions eligible for the prize that the judge hasn't yet rated.
    const requiredSubmissions = this.db.prepare(
      "SELECT submissionId FROM SubmissionPrize WHERE prizeId=? "+
        "EXCEPT "+
        "SELECT submissionId FROM RatingAssignment "+
          "LEFT JOIN Assignment ON RatingAssignment.assignmentId=Assignment.id "+
          "WHERE judgeId=?;"
    ).all(prizeId, judgeId);

    // All the new assignments should have priorities just above the previous, otherwise we default to the lowest
    // priority (1)
    const highestPriorityAssignment = this.db.prepare(
      "SELECT priority FROM Assignment WHERE judgeId=? ORDER BY priority DESC;"
    ).get(judgeId);
    let priority;
    if (highestPriorityAssignment) {
      priority = highestPriorityAssignment.priority + 1;
    } else {
      priority = 1;
    }

    // For each requiredSubmission we found, create a ranking assignment and add it
    for (let rs of requiredSubmissions) {
      const submissionId = rs.submissionId;
      const assignmentId = this.db.run(
        "INSERT INTO Assignment(judgeId, priority, type, status) VALUES (?, ?, ?, ?);",
        [judgeId, priority, ASSIGNMENT_TYPE_RATING, ASSIGNMENT_STATUS_ACTIVE]
      );
      this.db.run(
        "INSERT INTO RatingAssignment(assignmentId, submissionId) VALUES (?, ?);",
        [assignmentId, submissionId]
      );

      priority++;
    }

    // Create the ranking Assignment to compare all submissions in that prize.
    const newAssignmentId = this.db.run(
      "INSERT INTO Assignment(judgeId, priority, type, status) VALUES(?, ?, ?, ?);",
      [judgeId, priority, ASSIGNMENT_TYPE_RANKING, ASSIGNMENT_STATUS_ACTIVE]
    );
    const rankingAssignmentId = this.db.run(
      "INSERT INTO RankingAssignment(assignmentId, prizeId) VALUES (?, ?);",
      [newAssignmentId, prizeId]
    );

    // Add the empty rankings for each submission
    const submissionsForRanking = this.db.prepare(
      "SELECT submissionId FROM SubmissionPrize WHERE prizeId=?;"
    ).all(prizeId);
    for (let sfr of submissionsForRanking) {
      const submissionId = sfr.submissionId;
      this.db.prepare(
        "INSERT INTO Ranking(rankingAssignmentId, submissionId) "+
          "VALUES(?, ?);"
      ).run(rankingAssignmentId, submissionId);
    }
    this.db.commit();

    return {success: true};
  }
}
