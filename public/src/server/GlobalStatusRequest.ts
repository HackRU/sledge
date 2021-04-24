import {Database} from "./Database";
import {RequestHandler} from "./Request";

/**
 * Get the current phase
 */
export class GlobalStatusRequest implements RequestHandler {
  selectPhase: any;

  constructor(db: Database) {
    this.selectPhase = db.prepare(
      "SELECT phase FROM Status ORDER BY timestamp DESC;");
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_GLOBAL_STATUS";
  }

  simpleValidate(data: any) {
    return true;
  }

  handle(_: object): Promise<object> {
    let phase = this.selectPhase.get().phase;

    return Promise.resolve({
      phase
    });
  }
}
