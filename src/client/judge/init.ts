import {Store, createStore, applyMiddleware} from "redux";
import {createElement, Component} from "react";
import {Provider} from "react-redux";
import {render} from "react-dom";

import {reduce} from "./reducer.js";
import {JudgeApp} from "./JudgeApp.js";
import {SledgeClient} from "../sledge.js";
import {generateThunkMiddleware, dispatchAsyncToStore} from "./thunk.js";
import {initialize} from "./actions.js";
import {getSession} from "../session.js";

export function init() {
  let session = getSession();

  let client = new SledgeClient({
    host: document.location.host
  });

  let store = createStore(
    reduce,
    applyMiddleware(generateThunkMiddleware(client))
  );

  let container = document.getElementById("app");
  let topElement = createElement(Provider, {store},
    createElement(JudgeApp)
  );

  let once = true;
  render(topElement, container, function () {
    if (once) {
      dispatchAsyncToStore(store, initialize(session));
      once = false;
    }
  });
}
