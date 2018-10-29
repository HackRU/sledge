import {createElement, Component} from "react";
import {render} from "react-dom";

import {LoginApp} from "./LoginApp";

export function init() {
  let container = document.getElementById("app");
  let topElement = createElement(LoginApp, null);
  render(topElement, container);
}
