"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRatingScoresRequest = void 0;
const constants_1 = require("../shared/constants");
/**
 * Get rating assignment scores.
 * @deprecated use GetFullScoresRequest instead
 */
class GetRatingScoresRequest {
    constructor(db) {
        this.db = db;
    }
    canHandle(requestName) {
        return requestName === "REQUEST_GET_RATINGS_SCORES";
    }
    handleSync(data) {
        this.db.begin();
        const submissions = this.db.prepare("SELECT id, name, location FROM Submission ORDER BY id;").all();
        const judges = this.db.prepare("SELECT id, name, anchor FROM Judge ORDER BY id;").all();
        const assignments = this.db.prepare("SELECT " +
            "Assignment.judgeId AS judgeId, " +
            "Assignment.status AS status, " +
            "RatingAssignment.submissionId AS submissionId, " +
            "RatingAssignment.rating AS rating " +
            "FROM RatingAssignment " +
            "LEFT JOIN Assignment ON RatingAssignment.assignmentId=Assignment.id;").all();
        this.db.commit();
        const submissionsIdIndex = createIdIndexMap(submissions);
        const judgesIdIndex = createIdIndexMap(judges);
        const scores = assignments.map(ass => ({
            submissionIndex: submissionsIdIndex.get(ass.submissionId),
            judgeIndex: judgesIdIndex.get(ass.judgeId),
            active: ass.status === constants_1.ASSIGNMENT_STATUS_ACTIVE,
            rating: ass.rating
        }));
        return {
            submissions,
            judges,
            scores
        };
    }
}
exports.GetRatingScoresRequest = GetRatingScoresRequest;
function createIdIndexMap(objs) {
    const map = new Map();
    for (let i = 0; i < objs.length; i++) {
        map.set(objs[i].id, i);
    }
    return map;
}
//# sourceMappingURL=GetRatingScoresRequest.js.map