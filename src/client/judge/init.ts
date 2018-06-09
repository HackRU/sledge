import {createElement, Component} from "react";
import {render} from "react-dom";
import {Store, createStore} from "redux";

import {SledgeClient} from "lib/client/sledge";
import {JudgeApp} from "lib/client/components/judgeapp";
import {Session, getSession} from "lib/client/session";

export function init() {
  let session = getSession();

  let container = document.getElementById("app");
  let topElement = createElement("span", {}, "Not Yet Implemented");
  render(topElement, container);
}
