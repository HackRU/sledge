import {RequestHandler} from "./Request";
import {Database} from "./Database";

export class AssignPrizeToJudgeRequest implements RequestHandler {
  constructor (private db: Database) {
  }

  canHandle(data: object) {
    return data["requestName"] === "REQUEST_ASSIGN_PRIZE_TO_JUDGE";
  }

  handle(data: object): Promise<object> {
    return Promise.resolve(this.handleSync(data));
  }

  handleSync(data: object): object {
    const requiredSubmissions = this.db.prepare(
      "SELECT submissionId FROM SubmissionPrize WHERE prizeId=? "+
        "EXCEPT "+
        "SELECT submissionId FROM RatingAssignment "+
          "LEFT JOIN Assignment ON RatingAssignment.assignmentId=Assignment.id "+
          "WHERE judgeId=?;"
    ).all(data["judgeId"], data["prizeId"]);

    console.log(requiredSubmissions.map(x => x.submissionId));

    return {error: "NYI"};
  }
}
