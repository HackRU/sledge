/**
 * Given a statement and an array, runs the statement for each item in the array
 * in order and return an array of rowids corresponding to the original array.
 * Row ids come from info.lastInsertRowid (see better-sqlite3 api
 * documentation).
 */
export function runMany(stmt, rows: Array<any>): Array<number> {
  let inserted = [];
  for (let row of rows) {
    inserted.push(stmt.run(row).lastInsertROWID);
  }
  return inserted;
}
