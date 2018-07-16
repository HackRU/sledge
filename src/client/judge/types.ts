import {Store, Dispatch} from "redux";

import {
  Hack,
  Judge,
  Superlative,
  Category,
  PartialTable
} from "../../protocol/database.js";

import {
  SynchronizeShared
} from "../../protocol/events.js";

import {SledgeClient} from "../sledge.js";

////////////////////
// Store

export type JudgeStore = Store<State, Action>;

////////////////////
// State

export interface State {
  /* Current mode of interface */
  interfaceMode : InterfaceMode;
  /* Curretn judge Id */
  myJudgeId: number;
  /* IDs of hacks to be judged, in order they should be judged */
  myHacks : number[];
  /* ID of currently selected hack, 0 if no hacks to judge */
  currentHackId : number;

  /* Information specific to the overall rating, undefined if no hacks to judge */
  ratingFeature? : RatingFeature;
  /* Information specific to superlative rankings, undefined if no hacks to judge */
  superlativeFeature? : SuperlativeFeature;

  /* Local synchronized copy of hacks */
  hacks : PartialTable<Hack>;
  /* Local synchronized copy of judges */
  judges : PartialTable<Judge>;
  /* Local synchronized copy of superlatives */
  superlatives : PartialTable<Superlative>;
  /* Local synchronized copy of categories */
  categories : PartialTable<Category>;
}

export enum InterfaceMode {
  Loading,
  Judging,
  Listing
}

export interface RatingFeature {
  /* Marked as no show */
  noshow : boolean;
  /* ratings[superlativeId-1] is rating, -1 if category hasn't been rated */
  ratings : number[];
}

export interface SuperlativeFeature {
  eligible : Array<{
    superlativeId : number;
    firstHackId : number;
    secondHackId : number;
  }>;
}

////////////////////
// Actions

export type Action = {
    type: Type.Synchronize,
    data: SynchronizeShared
  };

export const enum Type {
  Synchronize = "JUDGEACTION_TYPE_SYNC"
}

////////////////////
// Async Actions

export type AsyncAction = (
    dispatch: Dispatch<Action>,
    getState: () => State,
    client: SledgeClient
  ) => void;
