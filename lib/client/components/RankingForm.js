"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingForm = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
exports.RankingForm = (props) => (react_1.default.createElement("form", { onSubmit: e => { e.preventDefault(); } },
    react_1.default.createElement(reactstrap_1.Card, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null, `Rank your favorite submissions for "${props.prizeName}"`),
            react_1.default.createElement(reactstrap_1.ListGroup, null,
                react_1.default.createElement(reactstrap_1.ListGroupItem, { tag: "button", onClick: props.onClear }, `CLEAR`),
                props.submissions.map((s, i) => (react_1.default.createElement(RankSubmissionItem, { key: i, rank: s.rank, submissionName: s.name, disabled: !props.canRankMore || s.rank > 0, onSelect: () => props.onSelectSubmission(i) })))))),
    react_1.default.createElement(reactstrap_1.Card, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.Button, { style: { width: "100%" }, size: "lg", onClick: props.onSubmit, disabled: !props.canSubmit, type: "button" }, `SUBMIT \u25B6`)))));
const RankSubmissionItem = (props) => (react_1.default.createElement(reactstrap_1.ListGroupItem, { tag: "button", className: props.rank > 0 ? "ranked" : "", onClick: props.onSelect, disabled: props.disabled }, props.rank > 0 ? `[${props.rank}] ${props.submissionName}` : props.submissionName));
//# sourceMappingURL=RankingForm.js.map