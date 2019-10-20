import {RequestHandler} from "./Request";
import {Database, Statement} from "./Database";
import {modulo} from "../shared/util";
import {GetAssignmentResponseData} from "../shared/GetAssignmentRequestTypes";

export class GetAssignmentRequest implements RequestHandler {
  constructor(private db: Database) {
  }

  canHandle(data: object) {
    return data["requestName"] === "REQUEST_GET_ASSIGNMENT";
  }

  handle(data: object) {
    return Promise.resolve(this.syncHandle(data));
  }

  getJudgeInfo(judgeId: number): {id: number, name: string, anchor: number} | null {
    return this.db.prepare(
      "SELECT id, name, anchor FROM Judge WHERE id=?;"
    ).get([judgeId]);
  }

  getNextActiveAssignment(judgeId: number): number | null {
    const row = this.db.prepare(
      "SELECT id FROM Assignment WHERE active=1 AND judgeId=? ORDER BY priority ASC;"
    ).get([judgeId]);
    if (row) {
      return row.id;
    } else {
      return null;
    }
  }

  getNextAssignmentPriority(judgeId: number): number {
    const highestPriorityAssignment = this.db.prepare(
      "SELECT priority FROM Assignment WHERE judgeId=? ORDER BY priority DESC;"
    ).get(judgeId);

    if (highestPriorityAssignment) {
      return highestPriorityAssignment.priority + 1;
    } else {
      return 1;
    }
  }

  createRatingAssignment(judgeId: number, anchor: number): number | null {
    let seenSubmissions: Set<number> = new Set();
    const seenSubmissionsStmt = this.db.prepare(
      "SELECT Submission.id AS id "+
        "FROM RatingAssignment "+
        "LEFT JOIN Assignment ON RatingAssignment.assignmentId = Assignment.id "+
        "LEFT JOIN Submission ON RatingAssignment.submissionId = Submission.id "+
        "WHERE Assignment.judgeId = ?;"
    );
    for (let submission of seenSubmissionsStmt.iterate([judgeId])) {
      seenSubmissions.add(submission.id);
    }

    const submissionLocationsStmt = this.db.prepare(
      "SELECT id, location FROM Submission;"
    );

    let closestSubmissionId = 0;
    let closestSubmissionDistance = Infinity;
    for (let submission of submissionLocationsStmt.iterate()) {
      const distance = modulo(submission.location - anchor, 10000);
      const seen = seenSubmissions.has(submission.id);

      if (!seen && distance < closestSubmissionDistance) {
        closestSubmissionId = submission.id;
        closestSubmissionDistance = distance;
      }
    }

    if (!closestSubmissionId) {
      return null;
    }

    const priority = this.getNextAssignmentPriority(judgeId);
    const newAssignmentId = this.db.prepare(
      "INSERT INTO Assignment(judgeId, priority, type, active) "+
        "VALUES(?, ?, 1, 1);"
    ).run(judgeId, priority).lastInsertRowid;
    this.db.prepare(
      "INSERT INTO RatingAssignment(assignmentId, submissionId) "+
        "VALUES(?, ?);"
    ).run(newAssignmentId, closestSubmissionId);

    return newAssignmentId as number;
  }

  getAssignmentDetails(assignmentId: number): GetAssignmentResponseData {
    const assignment = this.db.prepare(
      "SELECT type FROM Assignment WHERE id=?;"
    ).get(assignmentId);

    if (!assignment) {
      return null;
    } else if (assignment.type === 1) {
      return this.getRatingAssignmentDetails(assignmentId);
    } else if (assignment.type === 2) {
      return this.getRankingAssignmentDetails(assignmentId);
    } else {
      throw new Error(`Unknown assignment type ${assignment.type}`);
    }
  }

  getRatingAssignmentDetails(assignmentId: number): GetAssignmentResponseData {
    const assignment = this.db.prepare(
      "SELECT id, judgeId, priority, type, active FROM Assignment WHERE id=?;"
    ).get(assignmentId);

    const ratingAssignment = this.db.prepare(
      "SELECT id, assignmentId, submissionId FROM RatingAssignment WHERE assignmentId=?;"
    ).get(assignmentId);

    const submission = this.db.prepare(
      "SELECT id, name, location, trackId FROM Submission WHERE id=?;"
    ).get(ratingAssignment.submissionId);

    const categories = this.db.prepare(
      "SELECT id, name FROM Category WHERE trackId=? ORDER BY id;"
    ).all(submission.trackId).map(({id, name}) => ({id, name}));

    return {
      id: assignment.id,
      judgeId: assignment.judgeId,
      assignmentType: assignment.type,

      ratingAssignment: {
        submissionId: submission.id,
        submissionName: submission.name,
        submissionLocation: submission.location,

        categories
      }
    };
  }

  getRankingAssignmentDetails(assignmentId: number): GetAssignmentResponseData {
    const assignment: {
      id: number, judgeId: number, priority: number, type: number, active: number,
      rankingAssignmentId: number, prizeId: number, prizeName: string
    } = this.db.prepare(
      "SELECT "+
          "assignmentId AS id, judgeId, priority, type, active, "+
          "RankingAssignment.id AS rankingAssignmentId, prizeId, "+
          "Prize.name AS prizeName "+
        "FROM RankingAssignment "+
        "LEFT JOIN Assignment ON assignmentId=Assignment.id "+
        "LEFT JOIN Prize ON prizeId=Prize.id "+
        "WHERE assignmentId=?;"
    ).get(assignmentId);

    const submissions = this.db.prepare(
      "SELECT submissionId AS id, name, location "+
        "FROM Ranking "+
        "LEFT JOIN Submission ON submissionId=Submission.id "+
        "WHERE rankingAssignmentId=?;"
    ).all(assignment.rankingAssignmentId);

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

  syncHandle(data: object): object {
    if (!Number.isInteger(data["judgeId"])) {
      return {
        error: "Recieved bad data, judgeId must be an integer"
      };
    }

    const judge = this.getJudgeInfo(data["judgeId"]);
    if (!judge) {
      return {
        error: `No Judge with id ${data["judgeId"]}`
      };
    }

    this.db.begin();
    const currentActiveAssignment = this.getNextActiveAssignment(judge.id);
    if (currentActiveAssignment) {
      this.db.commit();
      return this.getAssignmentDetails(currentActiveAssignment);
    }

    const newAssignmentId = this.createRatingAssignment(judge.id, judge.anchor);
    this.db.commit();

    if (!newAssignmentId) {
      return {
        id: 0,
        judgeId: judge.id,
        assignmentType: 0
      };
    }

    return this.getAssignmentDetails(newAssignmentId);
  }
}
