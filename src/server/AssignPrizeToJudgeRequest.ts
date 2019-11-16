import {RequestHandler} from "./Request";
import {Database} from "./Database";
import {
  AssignPrizeToJudgeRequestData
} from "../shared/AssignPrizeToJudgeRequestTypes";
import * as tc from "./TypeCheck";

const validator = tc.hasShape({
  judgeId: tc.isId,
  prizeId: tc.isId
});

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
    // First, create assignments for all relevant submissions which they haven't rated
    const requiredSubmissions = this.db.prepare(
      "SELECT submissionId FROM SubmissionPrize WHERE prizeId=? "+
        "EXCEPT "+
        "SELECT submissionId FROM RatingAssignment "+
          "LEFT JOIN Assignment ON RatingAssignment.assignmentId=Assignment.id "+
          "WHERE judgeId=?;"
    ).all(prizeId, judgeId);

    // Get next assignment priority
    const highestPriorityAssignment = this.db.prepare(
      "SELECT priority FROM Assignment WHERE judgeId=? ORDER BY priority DESC;"
    ).get(judgeId);
    let priority;
    if (highestPriorityAssignment) {
      priority = highestPriorityAssignment.priority + 1;
    } else {
      priority = 1;
    }

    // Create rating assignments
    for (let rs of requiredSubmissions) {
      const submissionId = rs.submissionId;
      const assignmentId = this.db.prepare(
        "INSERT INTO Assignment(judgeId, priority, type, active) "+
          "VALUES(?, ?, 1, 1);"
      ).run(judgeId, priority).lastInsertRowid;
      this.db.prepare(
        "INSERT INTO RatingAssignment(assignmentId, submissionId) "+
          "VALUES(?, ?);"
      ).run(assignmentId, submissionId);

      priority++;
    }

    // Now create the ranking assignment
    const newAssignmentId = this.db.prepare(
      "INSERT INTO Assignment(judgeId, priority, type, active) "+
        "VALUES(?, ?, 2, 1);"
    ).run(judgeId, priority).lastInsertRowid;
    const rankingAssignmentId = this.db.prepare(
      "INSERT INTO RankingAssignment(assignmentId, prizeId) "+
        "VALUES(?, ?);"
    ).run(newAssignmentId, prizeId).lastInsertRowid;

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
