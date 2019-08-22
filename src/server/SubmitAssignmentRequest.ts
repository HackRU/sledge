import {Database} from "./Database";
import {RequestHandler} from "./Request";
import {
  ASSIGNMENT_TYPE_RATING
} from "../shared/constants";
import {
  RatingAssignmentForm,
  SubmitAssignmentRequestData,
  checkSubmitAssignmentRequestData
} from "../shared/SubmitAssignmentRequestTypes";

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
    if (!checkSubmitAssignmentRequestData(data)) {
      return {
        error: "Bad request data"
      };
    }

    const requestData = data as SubmitAssignmentRequestData;

    this.db.begin();

    const assignment = this.db.prepare(
      "SELECT id, type, active FROM Assignment WHERE id=?;"
    ).get(requestData["assignmentId"]);
    if (assignment.type !== ASSIGNMENT_TYPE_RATING || !assignment.active) {
      return {error: "Bad request"};
    }

    this.submitRatingAssignment(requestData.assignmentId, requestData.ratingAssignmentForm);

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
      "SELECT id FROM Category ORDER BY id;"
    ).all();

    for (let i=0;i<categories.length;i++) {
      this.db.prepare(
        "INSERT INTO Rating(ratingAssignmentId, categoryId, score) "+
          "VALUES(?, ?, ?);"
      ).run(ratingAssignment.id, categories[i].id, form.categoryRatings[i]);
    }

    this.db.prepare(
      "UPDATE RatingAssignment SET noShow=?,rating=? WHERE id=?;"
    ).run(ratingAssignment.id, form.noShow ? 1 : 0, form.rating);
  }
}
