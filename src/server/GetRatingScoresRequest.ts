import {Database} from "./Database";
import {RequestHandler} from "./Request";
import {ASSIGNMENT_STATUS_ACTIVE} from "../shared/constants";

/**
 * Get rating assignment scores.
 * @deprecated use GetFullScoresRequest instead
 */
export class GetRatingScoresRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_GET_RATINGS_SCORES";
  }

  handleSync(data: any): object {
    this.db.begin();
    const submissions = this.db.prepare(
      "SELECT id, name, location FROM Submission ORDER BY id;"
    ).all();
    const judges = this.db.prepare(
      "SELECT id, name, anchor FROM Judge ORDER BY id;"
    ).all();
    const assignments = this.db.prepare(
      "SELECT "+
          "Assignment.judgeId AS judgeId, "+
          "Assignment.status AS status, "+
          "RatingAssignment.submissionId AS submissionId, "+
          "RatingAssignment.rating AS rating "+
        "FROM RatingAssignment "+
        "LEFT JOIN Assignment ON RatingAssignment.assignmentId=Assignment.id;"
    ).all();
    this.db.commit();

    const submissionsIdIndex = createIdIndexMap(submissions);
    const judgesIdIndex = createIdIndexMap(judges);

    const scores = assignments.map(ass => ({
      submissionIndex: submissionsIdIndex.get(ass.submissionId),
      judgeIndex: judgesIdIndex.get(ass.judgeId),
      active: ass.status === ASSIGNMENT_STATUS_ACTIVE,
      rating: ass.rating
    }));

   return {
      submissions,
      judges,
      scores
    };
  }
}

function createIdIndexMap(objs: Array<{id: number}>): Map<number, number> {
  const map = new Map();
  for (let i=0;i<objs.length;i++) {
    map.set(objs[i].id, i);
  }
  return map;
}
