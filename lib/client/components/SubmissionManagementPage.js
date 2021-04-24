"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionManagementPage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const TabularActions_1 = require("./TabularActions");
exports.SubmissionManagementPage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "SubmissionManagementPage" },
    react_1.default.createElement("h1", null, `Submission Management`),
    react_1.default.createElement(TabularActions_1.TabularActions, { headings: ["Loc", "Track", "Name", "Average Rating", "Average Rating Normalized"], data: props.submissions.map(sub => [
            sub.location.toString(),
            sub.track,
            sub.name,
            Math.round(sub.averageRating).toString(),
            Math.round(sub.normalizedRating).toString()
        ]), actions: [] })));
//# sourceMappingURL=SubmissionManagementPage.js.map