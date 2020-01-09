import {range} from "../shared/util";
import {Database} from "./Database";
import {runMany} from "./DatabaseHelpers";
import {RequestHandler} from "./Request";
import integer from "integer";
import { PrizeBiasMatrix } from "./PrizeBiasMatrix";

export class BeginJudgingRequest implements RequestHandler {
  selectPhase: any;
  setPhase: any;
  countSubmissions: any;
  countJudges: any;
  countCategories: any;
  getSubmissionsByLocations: any;
  insertInitialAssignment: any;

  constructor(private db: Database) {
    this.selectPhase = db.prepare(
      "SELECT phase FROM Status ORDER BY timestamp DESC;");
    this.setPhase = db.prepare(
      "UPDATE Status SET phase=$phase,timestamp=$timestamp;");
    this.countSubmissions = db.prepare(
      "SELECT COUNT() as count FROM Submission;");
    this.countJudges = db.prepare(
      "SELECT COUNT() as count FROM Judge;");
    this.countCategories = db.prepare(
      "SELECT COUNT() as count FROM Category;");
    this.getSubmissionsByLocations = db.prepare(
      "SELECT id, name, location FROM Submission ORDER BY LOCATION;");
  }

  canHandle(requestName: string): boolean {
    return requestName === "REQUEST_BEGIN_JUDGING";
  }

  simpleValidate(data: any): boolean {
    return true;
  }

  handleSync(data: object): object {
    // We can only begin judging in phase 2
    let phase = this.selectPhase.get().phase;
    if (phase !== 1) {
      return {
        error: "Begin Judging can only be sent in setup phase"
      };
    }

    this.db.begin();

    // Ensure certain invariants are met
    let numSubmissions = this.countSubmissions.get().count;
    let numJudges = this.countJudges.get().count;
    let numCategories = this.countCategories.get().count;
    if (numJudges < 1) {
      this.db.rollback();
      return { error: "Must have at least one judge" };
    } else if (numSubmissions < numJudges) {
      this.db.rollback();
      return { error: "Must have at least as many submissions as judges" };
    } else if (numCategories < 1) {
      this.db.rollback();
      return { error: "Must have at least one category" };
    }

    let submissions = this.getSubmissionsByLocations.all();

    // Ensure all locations are unique positive integers
    for (let i=0;i<submissions.length;i++) {
      let unique = i === 0 || submissions[i].location !== submissions[i-1].location;
      if (!unique || submissions[i].location < 1) {
        this.db.rollback();
        return { error: "Locations must be unique positive integers" };
      }
    }

    // Give each judge an anchor location
    let judgeAnchors: Array<number> = [];
    for (let i=0;i<numJudges;i++) {
      let anchorIndex = Math.floor(i*numSubmissions/numJudges);
      judgeAnchors.push(submissions[anchorIndex].location);
    }
    runMany(this.db.prepare("UPDATE Judge SET anchor=? WHERE id=?;"), judgeAnchors.map((loc, j) => [loc, j+1]));

    // Setup judge prize biases
    (new PrizeBiasMatrix(this.db)).setupBiasMatrix();

    // Change phase to 2
    this.setPhase.run({
      phase: 2,
      timestamp: integer(Date.now())
    });

    this.db.commit();

    return {
      success: true
    };
  }
}
