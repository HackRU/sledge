import {Store} from "redux";

import {
  State,
  Action,
  AsyncAction,
  JudgeStore
} from "./types.js";
import {SledgeClient} from "../SledgeClient";

// This is redux middleware designed to allow async actions within the judge
// app. It's based on the principles of https://github.com/reduxjs/redux-thunk
// but typed specifically for JudgeApp.

export function generateThunkMiddleware(client: SledgeClient) {
  return function (store: JudgeStore) {
    return function (next: (a:Action) => void) {
      return function (action: Action | AsyncAction) {
        if (typeof action === "function") {
          return action(store.dispatch, store.getState, client);
        } else {
          return next(action);
        }
      }
    }
  }
}

export function dispatchAsyncToStore(store: Store<State, Action>, action: AsyncAction) {
  store.dispatch(action as any);
}
