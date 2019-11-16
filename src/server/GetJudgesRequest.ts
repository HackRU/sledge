import {Database} from "./Database";
import {RequestHandler} from "./Request";

export class GetJudgesRequest implements RequestHandler {
  // Sql statements
  selectJudges: any;

  constructor(db: Database) {
    this.selectJudges = db.prepare(
      "SELECT id, name FROM Judge ORDER BY name;");
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_GET_JUDGES";
  }

  simpleValidate(data: any) {
    return true;
  }

  handle(data: any): Promise<object> {
    let judges = this.selectJudges.all();

    return Promise.resolve({
      judges
    });
  }
}
