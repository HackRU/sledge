import "./sledge.js";
import "./utils.js";

import "./pages/admin.js";
import "./pages/judge.js";
import "./pages/login.js";
import "./pages/results.js";
import "./pages/sledge.js";
import "./pages/testdata.js";
import "./pages/utils.js";

import "./components/judgeapp.js";
import "./components/judgeinfo.js";
import "./components/project.js";
import "./components/projectlist.js";
import "./components/ratingbox.js";
import "./components/superlatives.js";
import "./components/toolbar.js";

let w = <any>window;
if (w.pages) {
    throw new Error("Property window.pages already exists.");
} else {
    w.pages = {};
}
