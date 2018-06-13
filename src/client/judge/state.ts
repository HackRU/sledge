import {
  Hack,
  Judge,
  Superlative,
  Category,
  PartialTable
} from "../../protocol/database.js";

export interface JudgeState {
  /* Current mode of interface */
  interfaceMode : InterfaceMode;
  /* IDs of hacks to be judged, in order they should be judged */
  myHacks : number[];
  /* ID of currently selected hack, 0 if no hacks to judge */
  currentHackId : number;

  /* Information specific to the overall rating, undefined if no hacks to judge */
  ratingFeature? : RatingFeature;
  /* Information specific to superlative rankings, undefined if no hacks to judge */
  superlativeFeature? : SuperlativeFeature;

  /* Message to show in modal, only used if interfaceMode is Modal */
  modalMessage : string;
  /* Overlay message, will display in any mode, if not empty */
  overlayMessage : string;

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
  /* Default mode, where judges rate hacks */
  Judging,
  /* Judges can see a list of all the hacks and how they were rated */
  Listing,
  /* Displays a modal dialog the judge must acknowledge before continuing */
  Modal
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

export const defaultState : JudgeState = {
  interfaceMode: InterfaceMode.Listing,
  myHacks: [],
  currentHackId: 0,
  modalMessage: "",
  overlayMessage: "",
  hacks: [],
  judges: [],
  superlatives: [],
  categories: []
}
