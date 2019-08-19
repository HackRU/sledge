import {log} from "./log";

import {Database} from "./Database";
import {runMany} from "./DatabaseHelpers";
import {RequestHandler} from "./Request";

import {PopulateRequestData, checkPopulateRequestData} from "../shared/PopulateRequestTypes";

export class PopulateRequest implements RequestHandler {
  // Sql statements
  selectPhase: any;
  insertSubmission: any;
  insertJudge: any;
  insertCategory: any;
  insertPrize: any;
  insertSubmissionPrize: any;

  constructor(private db: Database) {
    this.selectPhase = db.prepare(
      "SELECT phase FROM Status ORDER BY timestamp DESC;");
    this.insertSubmission = db.prepare(
      "INSERT INTO Submission(name, location) VALUES($name, $location);");
    this.insertJudge = db.prepare(
      "INSERT INTO Judge(name) VALUES($name);");
    this.insertCategory = db.prepare(
      "INSERT INTO Category(name) VALUES($name);");
    this.insertPrize = db.prepare(
      "INSERT INTO Prize(name, isOverall) VALUES($name, 0);");
    this.insertSubmissionPrize = db.prepare(
      "INSERT INTO SubmissionPrize(submissionId, prizeId, eligibility) "
        +"VALUES($submissionId, $prizeId, 1);");
  }

  canHandle(data: object): boolean {
    return data["requestName"] === "REQUEST_POPULATE";
  }

  handle(data: object): Promise<object> {
    return Promise.resolve(this.handleSync(data));
  }

  handleSync(data: object): object {
    if (data["requestName"] !== "REQUEST_POPULATE") {
      return null;
    }

    this.db.begin();

    // Populate is only valid in phase 1
    let phase = this.selectPhase.get().phase;
    if (phase !== 1) {
      log("WARN: Populate sent in wrong phase");
      this.db.commit();

      return {
        error: "Populate can only be sent in phase 1"
      };
    }

    if (!checkPopulateRequestData(data)) {
      this.db.commit();

      return {
        error: "Recieved bad data for request"
      };
    }

    // Insert submissions, judges, categories and prizes
    let submissionIds = runMany(this.insertSubmission, data["submissions"]);
    let judgeIds = runMany(this.insertJudge, data["judges"]);
    let categoryIds = runMany(this.insertCategory, data["categories"]);
    let prizeIds = runMany(this.insertPrize, data["prizes"]);

    // The submissions prizes are encoded by their index into submissions
    // and prizes
    let submissionPrizeRows = data["submissionPrizes"].map(sp => ({
      submissionId: submissionIds[sp["submission"]],
      prizeId: prizeIds[sp["prize"]]
    }));
    for (let sp of submissionPrizeRows) {
      if (typeof sp["submissionId"] !== "number" || typeof sp["prizeId"] !== "number") {
        this.db.rollback();

        return {
          error: "Bad data, probably out of bounds submission or prize index"
        };
      }
    }
    let submissionPrizeIds = runMany(this.insertSubmissionPrize, submissionPrizeRows);

    this.db.commit();

    return {
      success: true
    };
  }
}
