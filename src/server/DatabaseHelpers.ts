import {
  Statement, Database
} from "./Database";

/**
 * Given a statement and an array, runs the statement for each item in the array
 * in order and return an array of rowids corresponding to the original array.
 * Row ids come from info.lastInsertRowid (see better-sqlite3 api
 * documentation).
 * @deprecated Use Database.runMany
 */
export function runMany(stmt: Statement, rows: Array<any>): Array<number> {
  let inserted: Array<number> = [];
  for (let row of rows) {
    const rowId = stmt.run(row).lastInsertRowid;
    if (typeof rowId !== "number") {
      // This should never happend since we shouldn't have 64-bit integer support enabled
      throw new Error("Better-sqlite3 returned non-number row id");
    }

    inserted.push(rowId);
  }
  return inserted;
}

export function getCurrentPhase(db: Database): number {
  let stmt = db.prepare(
    "SELECT phase FROM Status ORDER BY timestamp DESC;"
  );
  return stmt.get().phase;
}
