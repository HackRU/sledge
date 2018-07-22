import {Store} from "redux";

import {
  SynchronizeGlobal
} from "../../protocol/events.js";

import {
  State,
  Action,
  Type,
  InterfaceMode
} from "./types.js";

export function reduce(oldState: State, action : Action): State {
  let state: State;
  if (!oldState) {
    state = {
      interfaceMode: InterfaceMode.Loading,
      myJudgeId: 0,
      myHacks: [],
      currentHackId: 0,

      loadingMessages: [],

      hacks: [],
      judges: [],
      superlatives: [],
      categories: []
    };
  } else {
    // Shallow copy, take care accessing nested elements
    state = {...oldState};
  }

  if (state.interfaceMode === InterfaceMode.Fail) {
    if (action.type === Type.Fail) {
      state.failMessage += `\n\n--------------------\n\n${action.message}`;
    } else {
      console.warn("Got action after failure", action);
    }
    return state;
  }

  if (action.type === Type.Fail) {
    // Everything stops the moment we get a fail event. A message is displayed and all
    // future actions are ignored. The only way to survive a fail is to refresh the page.
    state.interfaceMode = InterfaceMode.Fail;
    if (state.loadingMessages) {
      state.failMessage = `Loading Messages:\n${state.loadingMessages.map(m => ` - ${m}\n`)
          .join("")}\n`+`\n\n${action.message}`;
    } else {
      state.failMessage = action.message;
    }
  }

  if (action.type === Type.AddLoadingMessage) {
    if (state.interfaceMode !== InterfaceMode.Loading) {
      throw new Error();
    }

    state.loadingMessages = state.loadingMessages.slice();
    state.loadingMessages.push(action.message);
  }

  if (action.type === Type.PrepareJudging) {
    if (state.interfaceMode !== InterfaceMode.Loading) {
      throw new Error();
    }

    state.interfaceMode = InterfaceMode.Listing;
    state.myJudgeId = action.myJudgeId;
    state.loadingMessages = undefined;
    syncSharedDataToState(action.syncData, state);
  }

  if (action.type === Type.SynchronizeShared) {
    syncSharedDataToState(action.data, state);
  }

  if (action.type === Type.SynchronizeMyHacks) {
    state.myHacks = action.data.hackIds;
  }

  if (action.type === Type.OpenList) {
    if (
      state.interfaceMode !== InterfaceMode.Listing &&
      state.interfaceMode !== InterfaceMode.Judging
    ) throw new Error("Interface must be listing or judging to OpenList");

    state.interfaceMode = InterfaceMode.Listing;
    state.ratingFeature = undefined;
    state.superlativeFeature = undefined;
  }

  if (action.type === Type.OpenHack) {
    if (
      state.interfaceMode !== InterfaceMode.Listing &&
      state.interfaceMode !== InterfaceMode.Judging
    ) throw new Error("Interface must be listing or judging to OpenHack");

    state.interfaceMode = InterfaceMode.Judging;
    state.currentHackId = action.hackId;
    // TODO: Features
  }

  return state;
}

/** Mutates state */
function syncSharedDataToState(syncData: SynchronizeGlobal, state: State) {
  state.hacks = state.hacks.slice();
  for (let hack of syncData.hacks) {
    state.hacks[hack.id] = hack;
  }

  state.judges = state.judges.slice();
  for (let judge of syncData.judges) {
    state.judges[judge.id] = judge;
  }

  state.superlatives = state.superlatives.slice();
  for (let superlative of syncData.superlatives) {
    state.superlatives[superlative.id] = superlative;
  }

  state.categories = state.categories.slice();
  for (let category of syncData.categories) {
    state.categories[category.id] = category;
  }
}
