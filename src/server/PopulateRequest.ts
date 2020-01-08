import {Database} from "./Database";
import {runMany, getCurrentPhase} from "./DatabaseHelpers";
import {RequestHandler} from "./Request";
import * as tc from "./TypeCheck";

import {PopulateRequestData} from "../shared/PopulateRequestTypes";
import { PHASE_SETUP } from "../shared/constants";

const validator = tc.hasShape({
  requestName: tc.isConstant("REQUEST_POPULATE"),
  tracks: tc.isArrayOf(tc.hasShape({
    name: tc.isString
  })),
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
  constructor(private db: Database) {
  }

  canHandle(requestName: string): boolean {
    return requestName === "REQUEST_POPULATE";
  }

  simpleValidator(data: any): boolean {
    return validator(data);
  }

  handleSync(data: PopulateRequestData): object {
    this.db.begin();

    // Populate is only valid in phase 1
    if (getCurrentPhase(this.db) !== PHASE_SETUP) {
      this.db.commit();

      return {
        error: "Populate: wrong phase"
      };
    }

    // Indexes can't be above max index for that object
    for (let submission of data.submissions) {
      if (
        submission.track < 0 ||
        submission.track >= data.tracks.length
      ) {
        this.db.commit();
        return {error: "Out of bounds index in submissions"};
      }
    }
    for (let subPrz of data.submissionPrizes) {
      if (
        subPrz.prize < 0 ||
        subPrz.prize >= data.prizes.length ||
        subPrz.submission < 0 ||
        subPrz.submission >= data.submissions.length
       ) {
         this.db.commit();
         return {error: "Out of bounds index in submissionPrizes"};
      }
    }
    for (let cat of data.categories) {
      if (
        cat.track < 0 ||
        cat.track >= data.tracks.length
      ) {
        this.db.commit();
        return {error: "Out of bounds index in categories"};
      }
    }

    let trackIds = this.db.runMany(
      "INSERT INTO Track(name) VALUES($name);",
      data.tracks
    );
    let submissionIds = this.db.runMany(
      "INSERT INTO Submission(name, location, trackId, active) "
        +"VALUES($name, $location, $trackId, 1);",
      data.submissions.map(sub => ({
        name: sub.name,
        location: sub.location,
        trackId: trackIds[sub.track]
      }))
    );
    let prizeIds = this.db.runMany(
      "INSERT INTO Prize(name) VALUES($name);",
      data.prizes
    );
    this.db.runMany(
      "INSERT INTO SubmissionPrize(submissionId, prizeId, eligibility) "
        +"VALUES($submissionId, $prizeId, 1);",
      data.submissionPrizes.map(subPrz => ({
        submissionId: submissionIds[subPrz.submission],
        prizeId: prizeIds[subPrz.prize]
      }))
    );
    this.db.runMany(
      "INSERT INTO Category(name, trackId) "
        +"VALUES($name, $trackId);",
      data.categories.map(cat => ({
        name: cat.name,
        trackId: trackIds[cat.track]
      }))
    );
    this.db.runMany(
      "INSERT INTO Judge(name) VALUES($name);",
      data.judges
    );

    this.db.commit();

    return {
      success: true
    };
  }
}
