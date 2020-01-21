import {Database} from "./Database";
import {RequestHandler} from "./Request";
import { GetObjectsRequestData, GetObjectsResponseData } from "../shared/GetObjectsRequestTypes";
import * as tc from "./TypeCheck";

const validator = tc.hasShape({
  table: tc.isString
});

export class GetObjectsRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_GET_OBJECTS";
  }

  simpleValidate(data: any) {
    return validator(data);
  }

  handleSync(data: GetObjectsRequestData): GetObjectsResponseData | {error: string} {
    const tables = [
      "Status",
      "Track",
      "Submission",
      "Judge",
      "Prize",
      "Category",
      "Assignment"
    ];

    if (!tables.includes(data.table)) {
      return {
        error: `Can't get objects from table ${data.table}`
      };
    }

    const rows = this.db.all<{id: number, [field: string]: any}>(
      `SELECT * FROM "${data.table}" ORDER BY id;`, []
    );

    return {
      table: data.table,
      rows
    }
  }
}
