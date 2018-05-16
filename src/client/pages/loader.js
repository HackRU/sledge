(function (loader) {
"use strict";

// It's important for ease of development that the static site not require
// precompilation, but we might still want some sort of compilation step
// when launching the site in production. Dependency management is kind of a
// mess right now, so this file acts as a bad half-way point that's "good
// enough" but still not that great.

let allScripts = [
    "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js",
    "https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.development.js",
    "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.development.js",

    "/sledge.js",
    "/utils.js",

    "/login.js",
    "/judge.js",
    "/results.js",
    "/admin.js",
    "/testdata.js",

    "/components/judgeapp.js",
    "/components/judgeinfo.js",
    "/components/project.js",
    "/components/projectlist.js",
    "/components/ratingbox.js",
    "/components/superlatives.js",
    "/components/toolbar.js",
];
loader.allScripts = allScripts;

let allStylesheets = [
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css",

    "/login.css",
    "/judge.css",
    "/admin.css",

    "/components/judgeapp.css",
    "/components/judgeinfo.css",
    "/components/project.css",
    "/components/projectlist.css",
    "/components/ratingbox.css",
    "/components/superlatives.css",
    "/components/toolbar.css",
];
loader.allStylesheets = allStylesheets;

function loadJavascript(src, cb) {
    let scriptTag = document.createElement("script");
    scriptTag.type = "text/javascript";
    scriptTag.src = src;
    scriptTag.addEventListener("load", function (evt) {
        if (cb) cb();
    });

    document.head.appendChild(scriptTag);
}
loader.loadJavascript = loadJavascript;

function loadMultipleScripts(srcs, cb) {
    let scriptsLoaded = 0;

    for (let i=0;i<srcs.length;i++) {
        loadJavascript(srcs[i], function () {
            scriptsLoaded++;

            if (scriptsLoaded >= srcs.length) {
                if (cb) cb();
            }
        });
    }

    if ( srcs.length == 0 ) {
        window.setTimeout(function () {
            if (cb) cb();
        }, 0);
    }
}
loader.loadMultipleScripts = loadMultipleScripts;

function loadStylesheet(src, cb) {
    let linkTag = document.createElement("link");
    linkTag.rel = "stylesheet";
    linkTag.type = "text/css";
    linkTag.href = src;
    linkTag.addEventListener("load", function (evt) {
        if (cb) cb();
    });

    document.head.appendChild(linkTag);
}
loader.loadStylesheet = loadStylesheet;

function loadAll(cb) {
    for (let css of allStylesheets) {
        loadStylesheet(css);
    }

    // We can't just loadMultipleScripts because some scripts depend on others
    // when they load.
    let loadIndex = 0;
    function load() {
        if (loadIndex >= allScripts.length) {
            if ( document.readyState === "complete" && cb ) {
                cb();
            } else if (cb) {
                window.addEventListener("load", () => cb());
            }
        } else {
            loadJavascript(allScripts[loadIndex], function () {
                loadIndex++;
                load();
            });
        }
    }
    load();
}
loader.loadAll = loadAll;

})(this.loader || (this.loader = {}));
