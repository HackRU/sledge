import {
  ASSIGNMENT_TYPE_RANKING,
  ASSIGNMENT_TYPE_RATING
} from "./constants";

export interface GetFullScoresResponseData {
  submissions: Array<{id: number, name: string, location: number}>;
  judges: Array<{id: number, name: string, anchor: number}>;
  categories: Array<{id: number, name: string}>;
  prizes: Array<{id: number, name: string, eligibleSubmissions: Array<number>}>;
  assignments: Array<Assignment>;
}

export interface Assignment {
  id: number,
  type: number,
  judgeIndex: number,
  priority: number,
  active: boolean,

  // For RatingAssignments
  submissionIndex?: number,
  noShow?: boolean,
  rating?: number,
  ratings?: Array<number>
}

export function getPlaceholderFullScoresResponseData(): GetFullScoresResponseData {
  return {
    submissions: [],
    judges: [],
    categories: [],
    prizes: [],
    assignments: []
  };
}
