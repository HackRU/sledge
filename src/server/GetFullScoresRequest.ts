import {Database} from "./Database";
import {RequestHandler} from "./Request";
import {
  ASSIGNMENT_TYPE_RANKING,
  ASSIGNMENT_TYPE_RATING
} from "../shared/constants";
import {
  GetFullScoresResponseData,
  Assignment
} from "../shared/GetFullScoresRequestTypes";

import {DoubleEndedQueue} from "../shared/DoubleEndedQueue";

export class GetFullScoresRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(data: object): boolean {
    return data["requestName"] === "REQUEST_GET_FULL_SCORES";
  }

  handle(data: object): Promise<object> {
    return Promise.resolve(this.handleSync(data));
  }

  handleSync(data: object): GetFullScoresResponseData {
    // Get all the data within transaction before processing. Order by id or corresponding Assignment id.
    this.db.begin();
    const submissions: Array<{
      id: number,
      name: string,
      location: number
    }> = this.db.prepare(
      "SELECT id, name, location FROM Submission ORDER BY id;"
    ).all();
    const judges: Array<{
      id: number,
      name: string,
      anchor: number
    }> = this.db.prepare(
      "SELECT id, name, anchor FROM Judge ORDER BY id;"
    ).all();
    const categories: Array<{
      id: number,
      name: string
    }> = this.db.prepare(
      "SELECT id, name FROM Category ORDER BY id;"
    ).all();
    const dbPrizes: Array<{
      id: number,
      name: string
    }> = this.db.prepare(
      "SELECT id, name FROM Prize ORDER BY id;"
    ).all();
    const submissionPrizes: Array<{
      submissionId: number,
      prizeId: number
    }> = this.db.prepare(
      "SELECT submissionId, prizeId FROM SubmissionPrize WHERE eligibility=1 ORDER BY submissionId;"
    ).all();
    const dbAssignments: Array<{
      id: number,
      type: number,
      judgeId: number,
      priority: number,
      active: number,
      submissionId?: number,
      noShow?: number,
      rating?: number,
      prizeId?: number
    }> = this.db.prepare(
      "SELECT "+
        "Assignment.id, "+
        "Assignment.type, "+
        "Assignment.judgeId, "+
        "Assignment.priority, "+
        "Assignment.active, "+
        "RatingAssignment.submissionId, "+
        "RatingAssignment.noShow, "+
        "RatingAssignment.rating, "+
        "RankingAssignment.prizeId "+
      "FROM Assignment "+
      "LEFT JOIN RatingAssignment ON RatingAssignment.assignmentId = Assignment.id "+
      "LEFT JOIN RankingAssignment ON RankingAssignment.assignmentId = Assignment.id "+
      "ORDER BY Assignment.id;"
    ).all();
    const dbRatings: Array<{
      assignmentId: number,
      categoryId: number,
      score: number
    }> = this.db.prepare(
      "SELECT "+
        "Assignment.id AS assignmentId, "+
        "Rating.categoryId, "+
        "Rating.score "+
      "FROM Rating "+
      "LEFT JOIN RatingAssignment ON Rating.ratingAssignmentId = RatingAssignment.id "+
      "LEFT JOIN Assignment ON RatingAssignment.assignmentId = Assignment.id "+
      "ORDER BY Assignment.id, Rating.categoryId;"
    ).all();
    const dbRankings: Array<{
      assignmentId: number,
      submissionId: number,
      score: number
    }> = this.db.prepare(
      "SELECT "+
        "assignmentId, "+
        "submissionId, "+
        "score "+
      "FROM Ranking "+
      "LEFT JOIN RankingAssignment ON rankingAssignmentId=RankingAssignment.id "+
      "ORDER BY assignmentId, rank;"
    ).all();
    this.db.commit();

    // In the data we return, Judges, Categories and Submissions are references by indexes into their corresponding
    // arrays, however the SQL response references ids. We make a mapping for each from id to index.
    const submissionIdxMap = createIdIndexMapping(submissions);
    const judgeIdxMap = createIdIndexMapping(judges);
    const categoryIdxMap = createIdIndexMapping(categories);
    const prizeIdxMap = createIdIndexMapping(dbPrizes);

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
    const ratingQueue  = new DoubleEndedQueue(dbRatings);
    ratingQueue.enqueue(null);
    const rankingQueue = new DoubleEndedQueue(dbRankings);
    rankingQueue.enqueue(null);

    const assignments: Array<Assignment> = [];
    for (let dbAss of dbAssignments) {
      if (dbAss.type === ASSIGNMENT_TYPE_RATING) {
        // Get all the corresponding scores in a parallel array to Categories
        const ratings: Array<number> = [];
        for (let i=0;i<categories.length;i++) {
          ratings.push(null);
        }
        let rating = ratingQueue.next();
        while (rating && rating.assignmentId <= dbAss.id) {
          if (rating.assignmentId === dbAss.id) {
            ratings[submissionIdxMap.get(rating.categoryId)] = rating.score;
          }

          rating = ratingQueue.next();
        }
        ratingQueue.append(rating);

        assignments.push({
          id: dbAss.id,
          type: ASSIGNMENT_TYPE_RATING,
          judgeIndex: judgeIdxMap.get(dbAss.judgeId),
          priority: dbAss.priority,
          active: !!dbAss.active,

          submissionIndex: submissionIdxMap.get(dbAss.submissionId),
          noShow: !!dbAss.noShow,
          rating: dbAss.rating,
          ratings
        });
      } else if (dbAss.type == ASSIGNMENT_TYPE_RANKING) {
        const rankings: Array<{submissionIndex: number, score: number}> = [];
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
          type: ASSIGNMENT_TYPE_RANKING,
          judgeIndex: judgeIdxMap.get(dbAss.judgeId),
          priority: dbAss.priority,
          active: !!dbAss.active,

          prizeIndex: prizeIdxMap.get(dbAss.prizeId),
          rankings
        });
      } else {
        throw new Error(`Unknown assignment type ${dbAss.type}`);
      }
    }

    return {
      submissions,
      judges,
      categories,
      prizes,

      assignments
    };
  }
}

function createIdIndexMapping(arr: Array<{id: number}>): Map<number, number> {
  const map = new Map();
  for (let i=0;i<arr.length;i++) {
    map.set(arr[i].id, i);
  }
  return map;
}
