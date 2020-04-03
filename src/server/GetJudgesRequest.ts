import {Database} from "./Database";
import {RequestHandler} from "./Request";

/**
 * Get the current list of judges and their associated ids
 */
export class GetJudgesRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_GET_JUDGES";
  }

  simpleValidate(data: any) {
    return true;
  }

  handleSync(data: any): object {
    let judges = this.db.all<{
      id: number,
      name: string
    }>("SELECT id, name FROM Judge ORDER BY name;", []);

    return {
      judges
    };
  }
}
