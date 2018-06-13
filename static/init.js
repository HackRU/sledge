(function () {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/systemjs/0.21.3/system.js";
  document.head.appendChild(script);

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

  script.addEventListener("load", function () {
    SystemJS.config({
      packages: {
        "lib": { format: "system" }
      },

      map: {
        "socket.io-client": "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.0/socket.io.dev.js",
        "_react": "https://cdnjs.cloudflare.com/ajax/libs/react/16.3.2/umd/react.development.js",
        "_react-dom": "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.3.2/umd/react-dom.development.js",
        "react-redux": "https://cdnjs.cloudflare.com/ajax/libs/react-redux/5.0.7/react-redux.js",
        "redux": "https://cdnjs.cloudflare.com/ajax/libs/redux/4.0.0/redux.js",
        "reactstrap": "https://cdnjs.cloudflare.com/ajax/libs/reactstrap/6.0.1/reactstrap.full.js"
      },
      meta: {
        "socket.io-client": { format: "amd" },
        "_react": { format: "amd" },
        "_react-dom": { format: "amd" },
        "react-redux": { format: "amd" },
        "redux": { format: "amd" }
      },

      warnings: true
    });

    fixDefaultExportProblem("react", "_react");
    fixDefaultExportProblem("react-dom", "_react-dom");
  });

  window.init = function (modulepath) {
    return SystemJS.import(modulepath).then(function (m) {
      window.page = m;
      m.init();
    });
  }
})();
