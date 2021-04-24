"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingForm = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const RadioButtonGroup_1 = require("./RadioButtonGroup");
const CardSection_1 = require("./CardSection");
exports.RatingForm = (props) => (react_1.default.createElement("form", null,
    react_1.default.createElement(CardSection_1.CardSection, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null,
                react_1.default.createElement("h2", null, `Overall Rating: ${props.submissionName} (table ${props.submissionLocation})`),
                react_1.default.createElement("h3", null,
                    `Link to Submission: `,
                    " ",
                    react_1.default.createElement("a", { href: props.submissionURL, target: "_blank" }, props.submissionURL))))),
    react_1.default.createElement(CardSection_1.CardSection, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null,
                react_1.default.createElement("h2", null, `Did the submission show up?`)),
            react_1.default.createElement(RadioButtonGroup_1.RadioButtonGroup, { options: [
                    { label: "Yes", value: 0 },
                    { label: "No", value: 1 }
                ], value: props.noShow ? 1 : 0, onChange: newValue => props.onChangeNoShow(!!newValue), size: "lg" }))),
    react_1.default.createElement(CardSection_1.CardSection, null,
        react_1.default.createElement(react_1.default.Fragment, null, props.categories.map((catName, i) => (react_1.default.createElement("div", { key: i, style: { width: "100%" } },
            react_1.default.createElement("h3", { style: { textAlign: "center" } }, catName),
            react_1.default.createElement(RadioButtonGroup_1.RadioButtonGroup, { size: "lg", disabled: props.noShow, options: [
                    { label: "1", value: 1 },
                    { label: "2", value: 2 },
                    { label: "3", value: 3 },
                    { label: "4", value: 4 },
                    { label: "5", value: 5 }
                ], value: props.ratings[i], onChange: newValue => props.onChangeRating(i, newValue) })))))),
    react_1.default.createElement(CardSection_1.CardSection, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.Button, { style: { width: "100%" }, size: "lg", onClick: () => props.onSubmit(), disabled: !props.canSubmit }, "Submit \u25B6")))));
//# sourceMappingURL=RatingForm.js.map