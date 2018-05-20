import {Store, Reducer, createStore} from "redux";

import * as db  from "lib/protocol/database.js";

export function create() : Store<JudgeStore, JudgeAction> {
  return createStore(reducer);
}

export const reducer : Reducer<JudgeStore, JudgeAction> = function (state, action) {
  if (!state) {
    return {
      database: db.emptyStore
    };
  }

  return state;
}

export interface JudgeStore {
  database : db.DataStore;

  currentJudge? : db.JudgeRow;
  currentHack? : Hack;
}

export interface Hack {
  hack : db.HackRow;
  superlatives : Array<db.SuperlativeRow>;
}

export interface JudgeAction {
  type : string
}
