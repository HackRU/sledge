import {Store, createStore, applyMiddleware} from "redux";
import {createElement, Component} from "react";
import {Provider} from "react-redux";
import {render} from "react-dom";

import {reduce} from "./reducer";
import {JudgeApp} from "./JudgeApp";
import {SledgeClient} from "../SledgeClient";
import {generateThunkMiddleware, dispatchAsyncToStore} from "./thunk";
import {initialize, fail} from "./actions";
import {getSession} from "../session";

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
    createElement(JudgeApp, {store})
  );

  let once = true;
  render(topElement, container, function () {
    if (once) {
      dispatchAsyncToStore(store, initialize(session));
      once = false;
    }
  });
}
