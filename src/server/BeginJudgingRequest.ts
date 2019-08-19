import {range} from "../shared/util";
import {Database} from "./Database";
import {runMany} from "./DatabaseHelpers";
import {RequestHandler} from "./Request";
import integer from "integer";

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
    this.insertInitialAssignment = db.prepare(
      "INSERT INTO "
        +"Assignment "
          +"(judgeId, priority, prizeId, type, isComplete, ratingSubmissionId) "
        +"VALUES "
          +"($judgeId, 1, (SELECT id FROM Prize WHERE isOverall=1), 1, 0, "
            +"$submissionId);");
  }

  canHandle(data: object): boolean {
    return data["requestName"] === "REQUEST_BEGIN_JUDGING";
  }

  handle(data: object): Promise<object> {
    return Promise.resolve(this.syncHandle(data));
  }

  syncHandle(data: object): object {
    if (data["requestName"] !== "REQUEST_BEGIN_JUDGING") {
      return null;
    }

    this.db.begin();

    // We can only begin judging in phase 2
    let phase = this.selectPhase.get().phase;
    if (phase !== 2) {
      this.db.rollback();
      return {
        error: "Begin Judging can only be sent in phase 2"
      };
    }

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
      let unique = i === 0 ||
        submissions[i].location !== submissions[i-1].location;
      if (!unique || submissions[i].location < 1) {
        this.db.rollback();
        return { error: "Locations must be unique positive integers" };
      }
    }

    // We always begin by giving each judge a single submission, spread out
    // across the locations.
    let spread = Math.floor(numSubmissions / numJudges);
    runMany(this.insertInitialAssignment, range(numJudges).map(j => ({
      judgeId: j+1,
      submissionId: submissions[j*spread].id
    })));

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
