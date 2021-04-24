"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentPhase = exports.runMany = void 0;
/**
 * Given a statement and an array, runs the statement for each item in the array
 * in order and return an array of rowids corresponding to the original array.
 * Row ids come from info.lastInsertRowid (see better-sqlite3 api
 * documentation).
 * @deprecated Use Database.runMany
 */
function runMany(stmt, rows) {
    let inserted = [];
    for (let row of rows) {
        const rowId = stmt.run(row).lastInsertRowid;
        if (typeof rowId !== "number") {
            // If a rowid is not type "number" it's probably type "bigint"
            // which can happen if they get too large.
            throw new Error(`Got non-number rowid, of type ${typeof rowId} instead`);
        }
        inserted.push(rowId);
    }
    return inserted;
}
exports.runMany = runMany;
function getCurrentPhase(db) {
    let stmt = db.prepare("SELECT phase FROM Status ORDER BY timestamp DESC;");
    return stmt.get().phase;
}
exports.getCurrentPhase = getCurrentPhase;
//# sourceMappingURL=DatabaseHelpers.js.map