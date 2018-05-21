import {Store, Reducer, createStore} from "redux";

import {JudgeRow, HackRow, SuperlativeRow, getEmptyStore} from "lib/protocol/database";
import {SledgeData} from "lib/client/sledge";

export function create() : Store<JudgeStore, JudgeAction> {
  return createStore(reducer);
}

export const reducer : Reducer<JudgeStore, JudgeAction> = function (state, action) {
  if (!state) {
    state = {
      mode: Mode.Connecting
    };
  }

  if (action.type === Type.SledgeUpdate) {
    return updateMode({...state, sledgeData: action.sledgeData});
  }

  return state;
}

function updateMode(state : JudgeStore) : JudgeStore {
  let mode = state.sledgeData ? Mode.WaitingForHacks : Mode.Connecting;

  return { ...state, mode };
}

export interface JudgeStore {
  sledgeData? : SledgeData;

  mode : Mode;
  currentJudge? : JudgeRow;
  currentHack? : Hack;
}

export interface Hack {
  hack : HackRow;
  superlatives : Array<SuperlativeRow>;
}

export interface JudgeAction {
  type : Type;
  sledgeData? : SledgeData;
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
