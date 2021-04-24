"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.segue = void 0;
function segue(to) {
    if (to[0] === "/") {
        const base = window.location.protocol + "//" + window.location.host;
        const url = base + to;
        window.location.href = url;
    }
    else {
        window.location.href = to;
    }
}
exports.segue = segue;
//# sourceMappingURL=util.js.map