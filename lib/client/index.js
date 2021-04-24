"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router_1 = require("./Router");
// Import styles
require("./global.scss");
require("bootstrap/dist/css/bootstrap.css");
require("bootstrap/dist/css/bootstrap-grid.css");
window.addEventListener("load", function () {
    let global = window;
    const router = new Router_1.Router();
    router.start();
    global.router = router;
});
//# sourceMappingURL=index.js.map