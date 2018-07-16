import {Store} from "redux";

import {
  State,
  Action,
  InterfaceMode
} from "./types.js";

export function reduce(state: State, action : Action): State {
  if (!state) {
    state = {
      interfaceMode: InterfaceMode.Loading,
      myJudgeId: 0,
      myHacks: [],
      currentHackId: 0,

      hacks: [],
      judges: [],
      superlatives: [],
      categories: []
    };
  }

  return state;
}
