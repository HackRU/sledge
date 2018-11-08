import {createElement, Component} from "react";
import {render} from "react-dom";

import {ResultsApp} from "./ResultsApp";

export function init() {
  let container = document.getElementById("app");
  let topElement = createElement(ResultsApp, null);
  render(topElement, container);
}
