import {Store} from "redux";

import {JudgeState, defaultState} from "./state.js";
import {Action} from "./actions.js";

export type JudgeStore = Store<JudgeState, Action>;

export function reduce(state : JudgeState, action : Action) : JudgeState {
  if (!state) {
    state = defaultState;
  }

  return state;
}
