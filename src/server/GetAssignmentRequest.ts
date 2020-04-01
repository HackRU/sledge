import {RequestHandler} from "./Request";
import {Database, Statement} from "./Database";
import {modulo} from "../shared/util";
import {
  GetAssignmentRequestData,
  GetAssignmentResponseData
} from "../shared/GetAssignmentRequestTypes";
import * as tc from "./TypeCheck";
import { OnTheFlyAssigner } from "./OnTheFlyAssigner";

const validator = tc.hasShape({
  requestName: tc.isConstant("REQUEST_GET_ASSIGNMENT"),
  judgeId: tc.isId
});

/**
 * Get the next assignment a given judge should complete. Judges are always given the lowest assignment priority that's
 * still active.
 */
export class GetAssignmentRequest implements RequestHandler {
  private onTheFlyAssigner: OnTheFlyAssigner;

  constructor(private db: Database) {
    this.onTheFlyAssigner = new OnTheFlyAssigner(db);
  }

  canHandle(requestName: string) {
    return requestName === "REQUEST_GET_ASSIGNMENT";
  }

  simpleValidate(data: any) {
    return validator(data);
  }

  getJudgeInfo(judgeId: number): {id: number, name: string, anchor: number} | null {
    return this.db.prepare(
      "SELECT id, name, anchor FROM Judge WHERE id=?;"
    ).get([judgeId]);
  }

  getNextActiveAssignment(judgeId: number): number | null {
    const row = this.db.prepare(
      "SELECT id FROM Assignment WHERE status=1 AND judgeId=? ORDER BY priority ASC;"
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

  getAssignmentDetails(assignmentId: number): GetAssignmentResponseData | null {
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
      "SELECT id, judgeId, priority, type, status FROM Assignment WHERE id=?;"
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
      id: number, judgeId: number, priority: number, type: number, status: number,
      rankingAssignmentId: number, prizeId: number, prizeName: string
    } = this.db.prepare(
      "SELECT "+
          "assignmentId AS id, judgeId, priority, type, status, "+
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

  handleSync(data: any): GetAssignmentResponseData | { error: string } {
    const request: GetAssignmentRequestData = data;

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
