import {log} from "./log";

import {Database} from "./Database";
import {runMany} from "./DatabaseHelpers";
import {RequestHandler} from "./Request";
import * as tc from "./TypeCheck";

import {PopulateRequestData} from "../shared/PopulateRequestTypes";

const validator = tc.hasShape({
  requestName: tc.isConstant("REQUEST_POPULATE"),
  submissions: tc.isArrayOf(tc.hasShape({
    name: tc.isString,
    location: tc.isInteger
  })),
  judges: tc.isArrayOf(tc.hasShape({
    name: tc.isString
  })),
  categories: tc.isArrayOf(tc.hasShape({
    name: tc.isString
  })),
  prizes: tc.isArrayOf(tc.hasShape({
    name: tc.isString
  })),
  submissionPrizes: tc.isArrayOf(tc.hasShape({
    submission: tc.isInteger,
    prize: tc.isInteger
  }))
});

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

  canHandle(requestName: string): boolean {
    return requestName === "REQUEST_POPULATE";
  }

  simpleValidator(data: any): boolean {
    return validator(data);
  }

  handleSync(data: any): object {
    const request: PopulateRequestData = data;

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

    // Insert submissions, judges, categories and prizes
    const submissionIds = runMany(this.insertSubmission, request.submissions);
    const judgeIds = runMany(this.insertJudge, request.judges);
    const categoryIds = runMany(this.insertCategory, request.categories);
    const prizeIds = runMany(this.insertPrize, request.prizes);

    // The submissions prizes are encoded by their index into submissions
    // and prizes
    let submissionPrizeRows = request.submissionPrizes.map(sp => ({
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
