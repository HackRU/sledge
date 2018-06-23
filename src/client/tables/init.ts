import {createElement, Component} from "react";
import {render} from "react-dom";

import {TablesApp} from "./TablesApp.js";

export function init() {
  let container = document.getElementById("app");
  let topElement = createElement(TablesApp, null);
  render(topElement, container);
}
