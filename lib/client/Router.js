"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const directory_1 = require("./directory");
const Socket_1 = require("./Socket");
/**
 * Decides which Application to load, and mounts that application
 */
class Router {
    start() {
        let path = window["CURRENT_PAGE"];
        let page = directory_1.pages.find(p => p.path === path);
        if (!page) {
            throw new Error(`Page not found: ${path}`);
        }
        this.renderReactApp(page.component);
    }
    /**
     * Renders an Application to the page
     */
    renderReactApp(app) {
        const topElement = react_1.createElement(app);
        const container = getAppContainer();
        const mountedComponent = react_dom_1.render(topElement, container);
        // For debugging
        window["app"] = mountedComponent;
        window["socket"] = Socket_1.getSocket();
        setTimeout(() => {
            mountedComponent.ready();
        }, 0);
    }
}
exports.Router = Router;
function getAppContainer() {
    let container = document.getElementById("app");
    if (!container) {
        throw new Error("Could not find app container");
    }
    return container;
}
//# sourceMappingURL=Router.js.map