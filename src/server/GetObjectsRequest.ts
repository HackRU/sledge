import {Database} from "./Database";
import {RequestHandler} from "./Request";
import { GetObjectsRequestData, GetObjectsResponseData } from "../shared/GetObjectsRequestTypes";
import * as tc from "./TypeCheck";
import * as schemaValidator from "./SchemaValidator";

const validator = tc.hasShape({
  table: tc.isString,
  params: tc.hasShape({
    pagination: tc.hasShape({
      page: tc.isInteger,
      perPage: tc.isInteger
    }),
    sort: tc.hasShape({
      field: tc.isString,
      order: tc.oneOf([tc.isConstant("ASC"), tc.isConstant("DESC")])
    }),
    filter: tc.isObject
  })
});

/**
 * Get all rows of a specified table in the database satisfying specified
 * parameters. The filter parameter is ignored.
 *
 * This will return everything as-is, so won't be updated to reflect changes to
 * the database schema. In general, this should avoid being used.
 */
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
    if (!schemaValidator.isTable(this.db, data.table)) {
      return {
        error: `Can't get objects from nonexistent table ${data.table}`
      };
    }

    if (!schemaValidator.hasColumn(this.db, data.table, "id")) {
      return {
        error: `Can't get objects from table ${data.table} with no "id" column`
      };
    }

    const pagination = data.params.pagination;
    const firstId = ((pagination.page - 1) * pagination.perPage) + 1;
    const lastId = pagination.page * pagination.perPage;

    const rows = this.db.all<{id: number, [field: string]: any}>(
      `SELECT * FROM "${data.table}" WHERE id BETWEEN ${firstId} AND ${lastId} ORDER BY "${data.params.sort.field}" ${data.params.sort.order};`, []
    );

    const total = this.db.get<{"COUNT(id)": number}>(`SELECT COUNT(id) FROM "${data.table}"`, [])["COUNT(id)"];

    return {
      table: data.table,
      rows,
      total
    }
  }
}
