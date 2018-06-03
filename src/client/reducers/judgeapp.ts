import {Store, Reducer, createStore} from "redux";

export const reducer : Reducer<State, Action> = function (state={}, action) {
  return state;
}

export interface State {
}

export interface Action {
  type : Type;
}

export const enum Type {
  SledgeUpdate = "JUDGESTORE_TYPE_SLEDGE_UPDATE"
}

export const enum Mode {
  Connecting = "JUDGESTORE_MODE_CONNECTING",
  WaitingForHacks = "JUDGESTORE_MODE_WAITING_FOR_HACKS",
  Judging = "JUDGESTORE_MODE_JUDGING",
  ListHacks = "JUDGESTORE_MODE_LIST_HACKS",
  Failure = "JUDGESTORE_MODE_FAILURE"
}
