import {Store, createStore} from "redux";
import {createElement, Component} from "react";
import {Provider} from "react-redux";
import {render} from "react-dom";

import {SetupApp} from "./SetupApp";

export function init() {
  let store = createStore(x => ({}));

  let container = document.getElementById("app");
  let topElement = createElement(Provider, {store},
    createElement(SetupApp)
  );
  render(topElement, container);
}
