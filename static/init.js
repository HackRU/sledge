(function () {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/systemjs/0.21.3/system.js";
  document.head.appendChild(script);

  script.addEventListener("load", function () {
    SystemJS.config({
      map: {
        "socket.io-client": "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.0/socket.io.dev.js",
        "react": "https://cdnjs.cloudflare.com/ajax/libs/react/16.3.2/umd/react.development.js",
        "react-dom": "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.3.2/umd/react-dom.development.js"
      }
    });
  });

  window.init = function (modulepath) {
    return SystemJS.import(modulepath).then(function (m) {
      m.init();
    });
  }
})();
