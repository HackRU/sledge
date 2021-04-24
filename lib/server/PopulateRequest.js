"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopulateRequest = void 0;
const DatabaseHelpers_1 = require("./DatabaseHelpers");
const tc = __importStar(require("./TypeCheck"));
const constants_1 = require("../shared/constants");
const validator = tc.hasShape({
    requestName: tc.isConstant("REQUEST_POPULATE"),
    tracks: tc.isArrayOf(tc.hasShape({
        name: tc.isString
    })),
    submissions: tc.isArrayOf(tc.hasShape({
        name: tc.isString,
        url: tc.isString,
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
/**
 * Add the given tracks, submissions, judges, categories and prizes to the database. Additionally populate
 * SubmissionPrize to associate submissions and prizes. This is meant to populate the database with all data
 * necessary to start judging.
 */
class PopulateRequest {
    constructor(db) {
        this.db = db;
    }
    canHandle(requestName) {
        return requestName === "REQUEST_POPULATE";
    }
    simpleValidate(data) {
        return validator(data);
    }
    handleSync(data) {
        this.db.begin();
        // Populate is only valid in phase 1
        if (DatabaseHelpers_1.getCurrentPhase(this.db) !== constants_1.PHASE_SETUP) {
            this.db.commit();
            return {
                error: "Populate: wrong phase"
            };
        }
        // Indexes can't be above max index for that object
        for (let submission of data.submissions) {
            if (submission.track < 0 ||
                submission.track >= data.tracks.length) {
                this.db.commit();
                return { error: "Out of bounds index in submissions" };
            }
        }
        for (let subPrz of data.submissionPrizes) {
            if (subPrz.prize < 0 ||
                subPrz.prize >= data.prizes.length ||
                subPrz.submission < 0 ||
                subPrz.submission >= data.submissions.length) {
                this.db.commit();
                return { error: "Out of bounds index in submissionPrizes" };
            }
        }
        for (let cat of data.categories) {
            if (cat.track < 0 ||
                cat.track >= data.tracks.length) {
                this.db.commit();
                return { error: "Out of bounds index in categories" };
            }
        }
        let trackIds = this.db.runMany("INSERT INTO Track(name) VALUES($name);", data.tracks);
        let submissionIds = this.db.runMany("INSERT INTO Submission(name, url, location, trackId, active) "
            + "VALUES($name, $url, $location, $trackId, 1);", data.submissions.map(sub => ({
            name: sub.name,
            url: sub.url,
            location: sub.location,
            trackId: trackIds[sub.track]
        })));
        let prizeIds = this.db.runMany("INSERT INTO Prize(name) VALUES($name);", data.prizes);
        this.db.runMany("INSERT INTO SubmissionPrize(submissionId, prizeId, eligibility) "
            + "VALUES($submissionId, $prizeId, 1);", data.submissionPrizes.map(subPrz => ({
            submissionId: submissionIds[subPrz.submission],
            prizeId: prizeIds[subPrz.prize]
        })));
        this.db.runMany("INSERT INTO Category(name, trackId) "
            + "VALUES($name, $trackId);", data.categories.map(cat => ({
            name: cat.name,
            trackId: trackIds[cat.track]
        })));
        this.db.runMany("INSERT INTO Judge(name) VALUES($name);", data.judges);
        this.db.commit();
        return {
            success: true
        };
    }
}
exports.PopulateRequest = PopulateRequest;
//# sourceMappingURL=PopulateRequest.js.map