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
exports.SubmitAssignmentRequest = void 0;
const constants_1 = require("../shared/constants");
const tc = __importStar(require("./TypeCheck"));
const validator = tc.hasShape({
    requestName: tc.isConstant("REQUEST_SUBMIT_ASSIGNMENT"),
    assignmentId: tc.isId,
    ratingAssignmentForm: tc.isOptional(tc.hasShape({
        noShow: tc.isBoolean,
        rating: tc.isInteger,
        categoryRatings: tc.isArrayOf(tc.isInteger)
    })),
    rankingAssignmentForm: tc.isOptional(tc.hasShape({
        topSubmissionIds: tc.isFixedLengthArrayOf(tc.isId, 3)
    }))
});
/**
 * Submit an assignment
 */
class SubmitAssignmentRequest {
    constructor(db) {
        this.db = db;
    }
    canHandle(requestName) {
        return requestName === "REQUEST_SUBMIT_ASSIGNMENT";
    }
    simpleValidate(data) {
        return validator(data);
    }
    handleSync(data) {
        const requestData = data;
        this.db.begin();
        const assignment = this.db.get("SELECT id, type, status FROM Assignment WHERE id=?;", data.assignmentId);
        if (assignment.status !== constants_1.ASSIGNMENT_STATUS_ACTIVE) {
            this.db.rollback();
            return { error: "Submitted assignment is not active" };
        }
        let result;
        if (assignment.type === constants_1.ASSIGNMENT_TYPE_RATING) {
            if (!requestData.ratingAssignmentForm) {
                this.db.rollback();
                return { error: "Incorrect submission for rating assignment" };
            }
            result = this.submitRatingAssignment(requestData.assignmentId, requestData.ratingAssignmentForm, requestData.judgetimer);
        }
        else if (assignment.type === constants_1.ASSIGNMENT_TYPE_RANKING) {
            if (!requestData.rankingAssignmentForm) {
                this.db.rollback();
                return { error: "Incorrect submission for ranking assignment" };
            }
            result = this.submitRankingAssignment(requestData.assignmentId, requestData.rankingAssignmentForm, requestData.judgetimer);
        }
        else {
            this.db.rollback();
            return {
                error: `Unknown assignment type ${assignment.type}`
            };
        }
        if (!result.success) {
            this.db.rollback();
            return result;
        }
        this.db.run("UPDATE Assignment SET status=? WHERE id=?;", [constants_1.ASSIGNMENT_STATUS_COMPLETE, assignment.id]);
        this.db.commit();
        return {
            success: true
        };
    }
    submitRatingAssignment(assignmentId, form, timer) {
        const ratingAssignment = this.db.get("SELECT id FROM RatingAssignment WHERE assignmentId=?;", assignmentId);
        const categories = this.db.all("SELECT Category.id AS id FROM Category " +
            "LEFT JOIN Assignment ON Assignment.id=? " +
            "LEFT JOIN RatingAssignment ON assignmentId=Assignment.id " +
            "LEFT JOIN Submission ON submissionId=Submission.id " +
            "WHERE Category.trackId=Submission.trackId " +
            "ORDER BY id;", assignmentId);
        let score = 0;
        if (!form.noShow) {
            if (form.categoryRatings.length !== categories.length) {
                return {
                    success: false,
                    error: `Expected ${categories.length} category scores,` +
                        `got ${form.categoryRatings.length}`
                };
            }
            this.db.runMany("INSERT INTO Rating(ratingAssignmentId, categoryId, answer) " +
                "VALUES(?, ?, ?);", categories.map((c, i) => [ratingAssignment.id, c.id, form.categoryRatings[i]]));
            // Calculate the score as the average of all category rankings, normalized to 0-1 scale
            for (let rating of form.categoryRatings) {
                if (rating >= 5) {
                    score += 4;
                }
                else if (rating >= 1) {
                    score += (rating - 1) / 4;
                }
            }
            score /= form.categoryRatings.length * 4;
        }
        this.db.run("UPDATE RatingAssignment SET noShow=?, score=? WHERE id=?;", [form.noShow ? 1 : 0, score, ratingAssignment.id]);
        //update the main Assignment table
        this.db.run("UPDATE Assignment SET elapsedtime=? WHERE id=?;", [timer, ratingAssignment.id]);
        return {
            success: true
        };
    }
    submitRankingAssignment(assignmentId, form, timer) {
        if (form.topSubmissionIds.length < 1 || form.topSubmissionIds.length > 3) {
            return {
                success: false,
                error: `Got topSubmissionIds of length ${form.topSubmissionIds.length}`
            };
        }
        const rankingAssignment = this.db.get("SELECT id FROM RankingAssignment WHERE assignmentId=?;", assignmentId);
        this.db.runMany("UPDATE Ranking SET rank=?, score=? WHERE rankingAssignmentId=? AND submissionId=?;", form.topSubmissionIds.map((submissionId, i) => [i + 1, (3 - i) / 6, rankingAssignment.id, submissionId]));
        //update the main Assignment table
        this.db.run("UPDATE Assignment SET elapsedtime=? WHERE id=?;", [timer, rankingAssignment.id]);
        return {
            success: true
        };
    }
}
exports.SubmitAssignmentRequest = SubmitAssignmentRequest;
//# sourceMappingURL=SubmitAssignmentRequest.js.map