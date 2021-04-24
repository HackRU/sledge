"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFullScoresRequest = void 0;
const constants_1 = require("../shared/constants");
const DoubleEndedQueue_1 = require("../shared/DoubleEndedQueue");
/**
 * Get an object representing the most detailed state available of all the assignments. The object this returns is
 * basically a database dump of all assignments along with the submissions, judges, etc.
 */
class GetFullScoresRequest {
    constructor(db) {
        this.db = db;
    }
    canHandle(requestName) {
        return requestName === "REQUEST_GET_FULL_SCORES";
    }
    simpleValidate(data) {
        return true;
    }
    handleSync(data) {
        // TODO: Messy Code
        // Get all the data within transaction before processing. Order by id or corresponding Assignment id.
        this.db.begin();
        const dbSubmissions = this.db.prepare("SELECT id, name, trackId, location FROM Submission ORDER BY id;").all();
        const judges = this.db.prepare("SELECT id, name, anchor FROM Judge ORDER BY id;").all();
        const tracks = this.db.prepare("SELECT id, name FROM Track ORDER BY id;").all();
        const dbCategories = this.db.prepare("SELECT id, name, trackId FROM Category ORDER BY id;").all();
        const dbPrizes = this.db.prepare("SELECT id, name FROM Prize ORDER BY id;").all();
        const submissionPrizes = this.db.prepare("SELECT submissionId, prizeId FROM SubmissionPrize WHERE eligibility=1 ORDER BY submissionId;").all();
        const dbAssignments = this.db.prepare("SELECT " +
            "Assignment.id, " +
            "Assignment.type, " +
            "Assignment.judgeId, " +
            "Assignment.priority, " +
            "Assignment.status, " +
            "RatingAssignment.submissionId, " +
            "RatingAssignment.noShow, " +
            "RatingAssignment.score, " +
            "RankingAssignment.prizeId " +
            "FROM Assignment " +
            "LEFT JOIN RatingAssignment ON RatingAssignment.assignmentId = Assignment.id " +
            "LEFT JOIN RankingAssignment ON RankingAssignment.assignmentId = Assignment.id " +
            "ORDER BY Assignment.id;").all();
        const dbRatings = this.db.prepare("SELECT " +
            "Assignment.id AS assignmentId, " +
            "Rating.categoryId, " +
            "Rating.answer " +
            "FROM Rating " +
            "LEFT JOIN RatingAssignment ON Rating.ratingAssignmentId = RatingAssignment.id " +
            "LEFT JOIN Assignment ON RatingAssignment.assignmentId = Assignment.id " +
            "ORDER BY Assignment.id, Rating.categoryId;").all();
        const dbRankings = this.db.prepare("SELECT " +
            "assignmentId, " +
            "submissionId, " +
            "score " +
            "FROM Ranking " +
            "LEFT JOIN RankingAssignment ON rankingAssignmentId=RankingAssignment.id " +
            "ORDER BY assignmentId, rank;").all();
        this.db.commit();
        // In the data we return, Judges, Categories and Submissions are references by indexes into their corresponding
        // arrays, however the SQL response references ids. We make a mapping for each from id to index.
        const submissionIdxMap = createIdIndexMapping(dbSubmissions);
        const judgeIdxMap = createIdIndexMapping(judges);
        const trackIdxMap = createIdIndexMapping(tracks);
        const categoryIdxMap = createIdIndexMapping(dbCategories);
        const prizeIdxMap = createIdIndexMapping(dbPrizes);
        // Get mappings from category ids to rating indexes for each track
        const trackRatingMap = new Map();
        const trackNextIndex = new Map();
        for (let track of tracks) {
            trackRatingMap.set(track.id, new Map());
            trackNextIndex.set(track.id, 0);
        }
        for (let dbCategory of dbCategories) {
            const nextIndex = trackNextIndex.get(dbCategory.trackId);
            trackRatingMap.get(dbCategory.trackId).set(dbCategory.id, nextIndex);
            trackNextIndex.set(dbCategory.trackId, nextIndex + 1);
        }
        // Construct the prizes array, when when returns also contains a list of eligible submissions
        const prizes = dbPrizes.map(p => ({
            id: p.id,
            name: p.name,
            eligibleSubmissions: []
        }));
        for (let sp of submissionPrizes) {
            const prizeIndex = prizeIdxMap.get(sp.prizeId);
            const submissionIndex = submissionIdxMap.get(sp.submissionId);
            prizes[prizeIndex].eligibleSubmissions.push(submissionIndex);
        }
        // We go up the list of assignments and full in additional information from walking up other arrays. Since our
        // SQL data is sorted by Assignment.id, we can just walk up other arrays as we search.
        const ratingQueue = new DoubleEndedQueue_1.DoubleEndedQueue(dbRatings);
        ratingQueue.enqueue(null);
        const rankingQueue = new DoubleEndedQueue_1.DoubleEndedQueue(dbRankings);
        rankingQueue.enqueue(null);
        const assignments = [];
        for (let dbAss of dbAssignments) {
            if (dbAss.type === constants_1.ASSIGNMENT_TYPE_RATING) {
                const submission = dbSubmissions[submissionIdxMap.get(dbAss.submissionId)];
                // Get all the corresponding scores in a parallel array to Categories
                const ratings = [];
                for (let i = 0; i < trackNextIndex.get(submission.trackId); i++) {
                    ratings.push(null);
                }
                let rating = ratingQueue.next();
                while (rating && rating.assignmentId <= dbAss.id) {
                    if (rating.assignmentId === dbAss.id) {
                        ratings[trackRatingMap.get(submission.trackId).get(rating.categoryId)] = rating.answer;
                    }
                    rating = ratingQueue.next();
                }
                ratingQueue.append(rating);
                assignments.push({
                    id: dbAss.id,
                    type: constants_1.ASSIGNMENT_TYPE_RATING,
                    judgeIndex: judgeIdxMap.get(dbAss.judgeId),
                    priority: dbAss.priority,
                    active: dbAss.status === constants_1.ASSIGNMENT_STATUS_ACTIVE,
                    submissionIndex: submissionIdxMap.get(dbAss.submissionId),
                    noShow: !!dbAss.noShow,
                    rating: dbAss.score,
                    ratings: ratings.map(x => x)
                });
            }
            else if (dbAss.type == constants_1.ASSIGNMENT_TYPE_RANKING) {
                const rankings = [];
                let ranking = rankingQueue.next();
                while (ranking && ranking.assignmentId <= dbAss.id) {
                    if (ranking.assignmentId === dbAss.id) {
                        rankings.push({
                            submissionIndex: submissionIdxMap.get(ranking.submissionId),
                            score: ranking.score
                        });
                    }
                    ranking = rankingQueue.next();
                }
                rankingQueue.append(ranking);
                assignments.push({
                    id: dbAss.id,
                    type: constants_1.ASSIGNMENT_TYPE_RANKING,
                    judgeIndex: judgeIdxMap.get(dbAss.judgeId),
                    priority: dbAss.priority,
                    active: dbAss.status === constants_1.ASSIGNMENT_STATUS_ACTIVE,
                    prizeIndex: prizeIdxMap.get(dbAss.prizeId),
                    rankings
                });
            }
            else {
                throw new Error(`Unknown assignment type ${dbAss.type}`);
            }
        }
        const submissions = dbSubmissions.map(sub => ({
            id: sub.id,
            name: sub.name,
            url: sub.url,
            trackIndex: trackIdxMap.get(sub.trackId),
            location: sub.location
        }));
        const categories = dbCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            trackIndex: trackIdxMap.get(cat.trackId)
        }));
        return {
            submissions,
            judges,
            categories,
            prizes,
            tracks,
            assignments
        };
    }
}
exports.GetFullScoresRequest = GetFullScoresRequest;
function createIdIndexMapping(arr) {
    const map = new Map();
    for (let i = 0; i < arr.length; i++) {
        map.set(arr[i].id, i);
    }
    return map;
}
//# sourceMappingURL=GetFullScoresRequest.js.map