"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizePrizesPage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
exports.VisualizePrizesPage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "VisualizePrizesPage" },
    react_1.default.createElement("h1", null, `Visualize Prizes`),
    props.prizeTables.map((pt, k1) => (react_1.default.createElement("div", { key: k1 },
        react_1.default.createElement("h2", null, `Status Table: ${pt.name}`),
        react_1.default.createElement("table", null,
            react_1.default.createElement("tbody", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("td", null),
                    pt.locations.map((loc, k2) => (react_1.default.createElement("td", { key: k2 }, loc.toString())))),
                props.judges.map((name, ji) => (react_1.default.createElement("tr", { key: ji },
                    react_1.default.createElement("td", null, name),
                    pt.locations.map((l, li) => (react_1.default.createElement("td", { key: li, style: { background: colorFromStatus(pt.statuses[ji][li]) } }, ' ')))))))))))));
function colorFromStatus(statusObj) {
    if (statusObj.status === "JSSTATUS_NONE") {
        return "gray";
    }
    else if (statusObj.status === "JSSTATUS_ACTIVE") {
        return "yellow";
    }
    else if (statusObj.status === "JSSTATUS_NOSHOW") {
        return "red";
    }
    else if (statusObj.status === "JSSTATUS_COMPLETE") {
        return "green";
    }
    else {
        return "orange";
    }
}
;
;
;
//# sourceMappingURL=VisualizePrizesPage.js.map