export interface Hack {
  name: string;
  description: string;
  location: number;
}

export interface HackRow extends Hack {
  id : number;
}

export interface Judge {
  name: string;
  email: string;
}

export interface JudgeRow extends Judge {
  id : number;
}

export interface Token {
  secret: string;
  judgeId: number;
}

export interface TokenRow extends Token {
  id : number
}

export interface JudgeHack {
  judgeId: number;
  hackId: number;
  priority: number;
}

export interface JudgeHackRow extends JudgeHack {
  id : number;
}

export interface Superlative {
  name: string;
}

export interface SuperlativeRow extends Superlative {
  id : number;
}

export interface SuperlativePlacement {
  judgeId: number;
  superlativeId: number;
  firstChoiceId: number;
  secondChoiceId: number;
}

export interface SuperlativePlacementRow extends SuperlativePlacement {
  id : number;
}

export interface Rating {
  judgeId: number;
  hackId: number;
  rating: number;
}

export interface RatingRow extends Rating {
  id : number;
}

export const tableNames : Array<string> = [
  "hacks", "judges", "judgeHacks", "ratings", "superlatives", "superlativePlacements"
];

export const emptyStore : DataStore = {
  hacks: [],
  judges: [],
  judgeHacks: [],
  ratings: [],
  superlatives: [],
  superlativePlacements: []
};

export type TablePart<T> = Array<T | undefined>;

export interface DataStore {
  hacks : TablePart<HackRow>;
  judges : TablePart<JudgeRow>;
  judgeHacks : TablePart<JudgeHackRow>;
  ratings : TablePart<RatingRow>;
  superlatives : TablePart<SuperlativeRow>;
  superlativePlacements : TablePart<SuperlativePlacementRow>;
};
