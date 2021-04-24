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
exports.GetAssignmentRequest = void 0;
const tc = __importStar(require("./TypeCheck"));
const OnTheFlyAssigner_1 = require("./OnTheFlyAssigner");
const validator = tc.hasShape({
    requestName: tc.isConstant("REQUEST_GET_ASSIGNMENT"),
    judgeId: tc.isId
});
/**
 * Get the next assignment a given judge should complete. Judges are always given the lowest assignment priority that's
 * still active.
 */
class GetAssignmentRequest {
    constructor(db) {
        this.db = db;
        this.onTheFlyAssigner = new OnTheFlyAssigner_1.OnTheFlyAssigner(db);
    }
    canHandle(requestName) {
        return requestName === "REQUEST_GET_ASSIGNMENT";
    }
    simpleValidate(data) {
        return validator(data);
    }
    getJudgeInfo(judgeId) {
        return this.db.prepare("SELECT id, name, anchor FROM Judge WHERE id=?;").get([judgeId]);
    }
    getNextActiveAssignment(judgeId) {
        const row = this.db.prepare("SELECT id FROM Assignment WHERE status=1 AND judgeId=? ORDER BY priority ASC;").get([judgeId]);
        if (row) {
            return row.id;
        }
        else {
            return null;
        }
    }
    getNextAssignmentPriority(judgeId) {
        const highestPriorityAssignment = this.db.prepare("SELECT priority FROM Assignment WHERE judgeId=? ORDER BY priority DESC;").get(judgeId);
        if (highestPriorityAssignment) {
            return highestPriorityAssignment.priority + 1;
        }
        else {
            return 1;
        }
    }
    getAssignmentDetails(assignmentId) {
        const assignment = this.db.prepare("SELECT type FROM Assignment WHERE id=?;").get(assignmentId);
        if (!assignment) {
            return null;
        }
        else if (assignment.type === 1) {
            return this.getRatingAssignmentDetails(assignmentId);
        }
        else if (assignment.type === 2) {
            return this.getRankingAssignmentDetails(assignmentId);
        }
        else {
            throw new Error(`Unknown assignment type ${assignment.type}`);
        }
    }
    getRatingAssignmentDetails(assignmentId) {
        const assignment = this.db.prepare("SELECT id, judgeId, priority, type, status FROM Assignment WHERE id=?;").get(assignmentId);
        const ratingAssignment = this.db.prepare("SELECT id, assignmentId, submissionId FROM RatingAssignment WHERE assignmentId=?;").get(assignmentId);
        const submission = this.db.prepare("SELECT id, name, url, location, trackId FROM Submission WHERE id=?;").get(ratingAssignment.submissionId);
        const categories = this.db.prepare("SELECT id, name FROM Category WHERE trackId=? ORDER BY id;").all(submission.trackId).map(({ id, name }) => ({ id, name }));
        return {
            id: assignment.id,
            judgeId: assignment.judgeId,
            assignmentType: assignment.type,
            ratingAssignment: {
                submissionId: submission.id,
                submissionName: submission.name,
                submissionURL: submission.url,
                submissionLocation: submission.location,
                categories
            }
        };
    }
    getRankingAssignmentDetails(assignmentId) {
        const assignment = this.db.prepare("SELECT " +
            "assignmentId AS id, judgeId, priority, type, status, " +
            "RankingAssignment.id AS rankingAssignmentId, prizeId, " +
            "Prize.name AS prizeName " +
            "FROM RankingAssignment " +
            "LEFT JOIN Assignment ON assignmentId=Assignment.id " +
            "LEFT JOIN Prize ON prizeId=Prize.id " +
            "WHERE assignmentId=?;").get(assignmentId);
        const submissions = this.db.prepare("SELECT submissionId AS id, name, location " +
            "FROM Ranking " +
            "LEFT JOIN Submission ON submissionId=Submission.id " +
            "WHERE rankingAssignmentId=?;").all(assignment.rankingAssignmentId);
        return {
            id: assignment.id,
            judgeId: assignment.judgeId,
            assignmentType: assignment.type,
            rankingAssignment: {
                prizeId: assignment.prizeId,
                prizeName: assignment.prizeName,
                submissions
            }
        };
    }
    handleSync(data) {
        const request = data;
        const judge = this.getJudgeInfo(request.judgeId);
        if (!judge) {
            return {
                error: `No Judge with id ${data["judgeId"]}`
            };
        }
        this.db.begin();
        const currentActiveAssignment = this.getNextActiveAssignment(judge.id);
        if (currentActiveAssignment) {
            const assignmnet = this.getAssignmentDetails(currentActiveAssignment);
            this.db.commit();
            if (!assignmnet) {
                throw new Error("Can't refind assignment");
            }
            return assignmnet;
        }
        const newAssignmentId = this.onTheFlyAssigner.createAssignment(judge.id);
        this.db.commit();
        if (!newAssignmentId) {
            return {
                id: 0,
                judgeId: judge.id,
                assignmentType: 0
            };
        }
        const newAssignment = this.getAssignmentDetails(newAssignmentId);
        if (!newAssignment) {
            throw new Error("Can't find new assignment");
        }
        return newAssignment;
    }
}
exports.GetAssignmentRequest = GetAssignmentRequest;
//# sourceMappingURL=GetAssignmentRequest.js.map