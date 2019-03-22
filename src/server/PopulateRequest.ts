import {Database} from "./Database";

export function populateHandler(db: Database, data: object): object | null {
  if (data["requestName"] !== "REQUEST_POPULATE") {
    return null;
  }

  let sql = db.getSql();

  // Populate is only valid in phase 1
  let phase = sql
    .prepare("SELECT phase FROM Status ORDER BY timestamp DESC;")
    .get();

  console.log(phase);

  return {};
}
