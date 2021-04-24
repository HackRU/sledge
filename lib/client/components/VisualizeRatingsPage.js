"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizeRatingsPage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const util_1 = require("../../shared/util");
exports.VisualizeRatingsPage = (props) => {
    const tabular = tabulateResponse(props.response);
    return (react_1.default.createElement(reactstrap_1.Container, { id: "VisualizeRatingsPage" },
        react_1.default.createElement("h1", null, `Visualize Ratings`),
        react_1.default.createElement(reactstrap_1.Button, { onClick: props.onReload }, `Reload`),
        react_1.default.createElement("span", null,
            react_1.default.createElement("span", null, `Last Update: `),
            react_1.default.createElement("em", null, (new Date(props.timestamp)).toString())),
        react_1.default.createElement("h2", null, `Ratings Table`),
        react_1.default.createElement(RatingsTable, { ratings: tabular, judges: props.response.judges, submissions: props.response.submissions })));
};
;
const RatingsTable = (props) => (react_1.default.createElement("table", null,
    react_1.default.createElement("tbody", null,
        react_1.default.createElement("tr", null,
            react_1.default.createElement("td", null),
            props.submissions.map(s => (react_1.default.createElement("td", { key: s.id }, s.location.toString())))),
        props.judges.map((j, ji) => (react_1.default.createElement("tr", { key: j.id },
            react_1.default.createElement("td", null, j.name),
            props.submissions.map((s, si) => (react_1.default.createElement(RatingCell, { key: s.id, rating: props.ratings[ji][si] })))))))));
const RatingCell = (props) => {
    const classes = ["rating-cell"];
    if (props.rating === -3) {
        classes.push("bg-grey");
    }
    else if (props.rating === -2) {
        classes.push("bg-yellow");
    }
    else if (props.rating === -1) {
        classes.push("bg-red");
    }
    else if (props.rating >= 0) {
        classes.push("bg-green");
    }
    return (react_1.default.createElement("td", { className: classes.join(" ") }, props.rating >= 0 ? props.rating.toString() : ""));
};
/**
 * Converts the response into a 2d array such that arr[judgeIndex][submissionIndex] means
 * no-show if -1, still active if -2 and no assignment if -3, otherwise the rating.
 */
function tabulateResponse(response) {
    let tabular = util_1.range(response.judges.length).map(_ => util_1.range(response.submissions.length).map(_ => (-3)));
    for (let ass of response.scores) {
        tabular[ass.judgeIndex][ass.submissionIndex] = ass.active ? -2 : ass.rating;
    }
    return tabular;
}
//# sourceMappingURL=VisualizeRatingsPage.js.map