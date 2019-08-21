import {Database} from "./Database";
import {RequestHandler} from "./Request";
import {
  ASSIGNMENT_TYPE_RATING
} from "../shared/constants";

export class SubmitAssignmentRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(data: object) {
    return data["requestName"] === "REQUEST_SUBMIT_ASSIGNMENT";
  }

  handle(data: object): Promise<object> {
    return Promise.resolve(this.handleSync(data));
  }

  handleSync(data: object): object {
    const assignment = this.db.prepare(
      "SELECT type, active FROM Assignment WHERE id=?;"
    ).get(data["assignmentId"]);
    if (assignment.type !== ASSIGNMENT_TYPE_RATING || !assignment.active) {
      return {error: "Bad request"};
    }

    console.log(data);

    const ratingAssignment = this.db.prepare(
      "SELECT id FROM RatingAssignment WHERE assignmentId=?;"
    ).get(data["assignmentId"]);
    const categories = this.db.prepare(
      "SELECT id FROM Category ORDER BY id;"
    ).all();

    this.db.begin();
    for (let i=0;i<categories.length;i++) {
      this.db.prepare(
        "INSERT INTO Rating(ratingAssignmentId, categoryId, score) "+
          "VALUES(?, ?, ?);"
      ).run(ratingAssignment.id, categories[i].id, data["ratingAssignmentForm"]["categoryRating"][i]);
    }
    this.db.prepare(
      "UPDATE Assignment SET active=0 WHERE id=?;"
    ).run(data["assignmentId"]);
    this.db.commit();

    return {
      success: true
    };
  }
}
