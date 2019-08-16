import {log} from "./log";

import integer from "integer";

import {Database} from "./Database";
import {runMany} from "./DatabaseHelpers";

export class GetJudgesRequest {
  // Sql statements
  selectJudges;

  constructor(private db: Database) {
    this.selectJudges = db.prepare(
      "SELECT id, name FROM Judge ORDER BY name;");
  }

  handler(data: object): object | null {
    if (data["requestName"] !== "GET_JUDGES") {
      return null;
    }

    let judges = this.selectJudges.all();

    return {
      success: true,
      judges
    };
  }
}
