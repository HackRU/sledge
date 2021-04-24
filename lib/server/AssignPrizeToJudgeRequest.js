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
exports.AssignPrizeToJudgeRequest = void 0;
const tc = __importStar(require("./TypeCheck"));
const constants_1 = require("../shared/constants");
const validator = tc.hasShape({
    judgeId: tc.isId,
    prizeId: tc.isId
});
/**
 * Creates a rating assignment for every submission eligible for a given prize that a judge has not yet rated,
 * and assigns it to that judge. Then, creates a ranking assignment asking the judge to choose their favorite
 * three submissions for that prize.
 */
class AssignPrizeToJudgeRequest {
    constructor(db) {
        this.db = db;
    }
    canHandle(requestName) {
        return requestName === "REQUEST_ASSIGN_PRIZE_TO_JUDGE";
    }
    simpleValidate(data) {
        return validator(data);
    }
    handleSync(data) {
        const request = data;
        const { prizeId, judgeId } = request;
        this.db.begin();
        // The set of submissions eligible for the prize that the judge hasn't yet rated.
        const requiredSubmissions = this.db.prepare("SELECT submissionId FROM SubmissionPrize WHERE prizeId=? " +
            "EXCEPT " +
            "SELECT submissionId FROM RatingAssignment " +
            "LEFT JOIN Assignment ON RatingAssignment.assignmentId=Assignment.id " +
            "WHERE judgeId=?;").all(prizeId, judgeId);
        // All the new assignments should have priorities just above the previous, otherwise we default to the lowest
        // priority (1)
        const highestPriorityAssignment = this.db.prepare("SELECT priority FROM Assignment WHERE judgeId=? ORDER BY priority DESC;").get(judgeId);
        let priority;
        if (highestPriorityAssignment) {
            priority = highestPriorityAssignment.priority + 1;
        }
        else {
            priority = 1;
        }
        // For each requiredSubmission we found, create a ranking assignment and add it
        for (let rs of requiredSubmissions) {
            const submissionId = rs.submissionId;
            const assignmentId = this.db.run("INSERT INTO Assignment(judgeId, priority, type, status) VALUES (?, ?, ?, ?);", [judgeId, priority, constants_1.ASSIGNMENT_TYPE_RATING, constants_1.ASSIGNMENT_STATUS_ACTIVE]);
            this.db.run("INSERT INTO RatingAssignment(assignmentId, submissionId) VALUES (?, ?);", [assignmentId, submissionId]);
            priority++;
        }
        // Create the ranking Assignment to compare all submissions in that prize.
        const newAssignmentId = this.db.run("INSERT INTO Assignment(judgeId, priority, type, status) VALUES(?, ?, ?, ?);", [judgeId, priority, constants_1.ASSIGNMENT_TYPE_RANKING, constants_1.ASSIGNMENT_STATUS_ACTIVE]);
        const rankingAssignmentId = this.db.run("INSERT INTO RankingAssignment(assignmentId, prizeId) VALUES (?, ?);", [newAssignmentId, prizeId]);
        // Add the empty rankings for each submission
        const submissionsForRanking = this.db.prepare("SELECT submissionId FROM SubmissionPrize WHERE prizeId=?;").all(prizeId);
        for (let sfr of submissionsForRanking) {
            const submissionId = sfr.submissionId;
            this.db.prepare("INSERT INTO Ranking(rankingAssignmentId, submissionId) " +
                "VALUES(?, ?);").run(rankingAssignmentId, submissionId);
        }
        this.db.commit();
        return { success: true };
    }
}
exports.AssignPrizeToJudgeRequest = AssignPrizeToJudgeRequest;
//# sourceMappingURL=AssignPrizeToJudgeRequest.js.map