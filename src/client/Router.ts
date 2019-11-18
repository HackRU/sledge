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

import {createElement, Component} from "react";
import {render} from "react-dom";

import {pages} from "./directory";

/**
 * Decide which page to load
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
   * Renders a react app to the "app" div on the page. The app argument is passed
   * to React.createElement
   *
   * React Components postfixed by App indicate they are toplevel components, and
   * can assume they will never be unmounted and the only other components will be
   * created by them.
   */
  renderReactApp(app: any) {
    const topElement = createElement(app);
    const container = getAppContainer();
    const mountedComponent = render(topElement, container);

    // For debugging
    (window as any)["app"] = mountedComponent;
  }
}

function getAppContainer(): HTMLElement {
  let container = document.getElementById("app");
  if (!container) {
    throw new Error("Could not find app container");
  }
  return container;
}
