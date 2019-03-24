import {log} from "./log";

import {Database} from "./Database";

export function populateHandler(db: Database, data: object): object | null {
  if (data["requestName"] !== "REQUEST_POPULATE") {
    return null;
  }

  // Populate is only valid in phase 1
  let phase = db
    .prepare("SELECT phase FROM Status ORDER BY timestamp DESC;")
    .get().phase;
  if (phase !== 1) {
    log("WARN: Populate sent in wrong phase");

    return {
      error: "Populate can only be sent in phase 1"
    };
  }

  db.prepare("BEGIN;").run();

  // Populate Submission table
  let addSubmission = db
    .prepare("INSERT INTO Submission(name, location) VALUES($name, $location);");
  let submissionIds = runMany(addSubmission, data["submissions"]);

  if (Array.isArray(data["submissions"])) {
    for (let submission of data["submissions"]) {
      let r = addSubmission.run(data["name"], data["location"]);
      r.lastInsertROWID
    }
  }

  // Populate Judges table
  let addJudge = db
    .prepare("INSERT INTO Judge(name) VALUES(?);");
  if (Array.isArray(data["judges"])) {
    for (let submission of data["judges"]) {
      addSubmission.run(data["name"]);
    }
  }

  // Populate Prize table
  let addCategory = db
    .prepare("INSERT INTO Category(name) VALUES(?);");
  if (Array.isArray(data["judges"])) {
    for (let submission of data["judges"]) {
      addSubmission.run(data["name"]);
    }
  }

  db.prepare("COMMIT;").run();

  return {};
}

function runMany(stmt: any, rows: Array<object>): Array<number> {
  let inserted = [];
  for (let row of rows) {
    let r = stmt.run(row);
    inserted.push(r.lastInsertRowid);
  }
  return inserted;
}
