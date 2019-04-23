import {log} from "./log";

import integer from "integer";

import {Database} from "./Database";

export class GlobalStatusRequest {
  selectPhase;

  constructor(private db: Database) {
    this.selectPhase = db.prepare(
      "SELECT phase FROM Status ORDER BY timestamp DESC;");
  }

  handler(data: object): object | null {
    if (data["requestName"] !== "REQUEST_GLOBAL_STATUS") {
      return null;
    }

    this.db.begin();

    let phase = this.selectPhase.get().phase;

    this.db.commit();

    return {
      phase
    };
  }
}
