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
(function () {
  // This file is the entry point for all client pages. Logic specific to the
  // exact page is loaded later.

  // Helper function since some modules require an extra fix
  function fixDefaultExportProblem(internalModuleName, externalModuleName) {
    // SystemJS AMD modules appear to only export a default, requiring the
    // ensure module be loaded in. For instance,
    //   import X from "x";
    //   X.doStuff();
    // works but the seemingly equivalent
    //   import {doStuff} from "x";
    // does not work, even though the type definitions associated with the
    // library allow either type.
    SystemJS.register(internalModuleName, [externalModuleName], function (_export) {
      var module;
      return {
        setters: [ function (m) { module = m.default } ],
        execute: function () {
          var key;
          for (key in module) {
            _export(key, module[key]);
          }
          _export("default", module);
        }
      }
    });
  }

  // Configure SystemJS
  SystemJS.config({
    packages: {
      "/lib": { format: "system" },
      "/testrunner.js": { format: "system" }
    },

    map: {
      "socket.io-client": "/vendor/socket.io.dev.js",
      "_react": "/vendor/react.development.js",
      "_react-dom": "/vendor/react-dom.development.js",
      "react-redux": "/vendor/react-redux.js",
      "redux": "/vendor/redux.js",
      "reactstrap": "/vendor/reactstrap.full.js",
      "_immutable": "/vendor/immutable.js",
      "_papaparse": "/vendor/papaparse.js",
      "mocha": "/vendor/mocha.js",
      "chai": "/vendor/chai.js"
    },
    meta: {
      "socket.io-client": { format: "amd" },
      "_react": { format: "amd" },
      "_react-dom": { format: "cjs" },
      "react-redux": { format: "amd" },
      "redux": { format: "amd" },
      "_immutable": { format: "amd" },
      "_papaparse": { format: "amd" },
      "mocha": { format: "global" },
      "chai": { format: "amd" }
    },

    warnings: true
  });

  // Apply fixes to software that needs it
  fixDefaultExportProblem("react", "_react");
  fixDefaultExportProblem("react-dom", "_react-dom");
  fixDefaultExportProblem("immutable", "_immutable");
  fixDefaultExportProblem("papaparse", "_papaparse");

  // Second stage of initialization is started by the page after load
  // This is not run on test.html
  window.init2 = function() {
    // The Router will decide which page to actually load
    window.SystemJS.import("client/Router").then(function (m) {
      let router = new m.Router();
      router.start();
    });
  };
})();
