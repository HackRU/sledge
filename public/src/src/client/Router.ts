/*
 * Sledge - A judging system for hackathons
 * Copyright (C) 2018 The Sledge Authors

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {createElement, Component, ComponentClass} from "react";
import {render} from "react-dom";

import {ApplicationConstructor, pages} from "./directory";
import {getSocket} from "./Socket";
import {Application} from "./Application";

/**
 * Decides which Application to load, and mounts that application
 */
export class Router {
  start() {
    let path = (window as any)["CURRENT_PAGE"];
    let page = pages.find(p => p.path === path);

    if (!page) {
      throw new Error(`Page not found: ${path}`);
    }

    this.renderReactApp(page.component);
  }

  /**
   * Renders an Application to the page
   */
  renderReactApp(app: ApplicationConstructor) {
    const topElement = createElement(app);
    const container = getAppContainer();
    const mountedComponent = render(topElement, container);

    // For debugging
    (window as any)["app"] = mountedComponent;
    (window as any)["socket"]= getSocket();

    setTimeout(() => {
      mountedComponent.ready();
    }, 0);
  }
}

function getAppContainer(): HTMLElement {
  let container = document.getElementById("app");
  if (!container) {
    throw new Error("Could not find app container");
  }
  return container;
}
