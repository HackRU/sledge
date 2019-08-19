import {Database} from "./Database";
import {RequestHandler} from "./Request";

export class GetJudgesRequest implements RequestHandler {
  // Sql statements
  selectJudges: any;

  constructor(db: Database) {
    this.selectJudges = db.prepare(
      "SELECT id, name FROM Judge ORDER BY name;");
  }

  canHandle(data: object) {
    return data["requestName"] === "REQUEST_GET_JUDGES";
  }

  handle(_: object): Promise<object> {
    let judges = this.selectJudges.all();

    return Promise.resolve({
      judges
    });
  }
}
