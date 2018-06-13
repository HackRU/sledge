import {Store, createStore} from "redux";
import {createElement, Component} from "react";
import {Provider} from "react-redux";
import {render} from "react-dom";

import {reduce} from "./reducer";
import {JudgeApp} from "../components/JudgeApp.js";

export function init() {
  let store = createStore(reduce);

  let container = document.getElementById("app");
  let topElement = createElement(Provider, {store},
    createElement(JudgeApp)
  );
  render(topElement, container);
}
