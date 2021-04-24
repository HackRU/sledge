"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlPanelPage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const ListSelect_1 = require("./ListSelect");
exports.ControlPanelPage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "ControlPanelPage" },
    react_1.default.createElement("h1", null, `Admin Control Panel`),
    react_1.default.createElement(reactstrap_1.Form, null,
        react_1.default.createElement("h2", null, `Assign Prize to Judge`),
        react_1.default.createElement(reactstrap_1.FormGroup, null,
            react_1.default.createElement(reactstrap_1.Label, null, `Judge`),
            react_1.default.createElement(ListSelect_1.ListSelect, { choices: props.judges, choiceIndex: props.assignPrizeToJudgeForm.judgeIndex, placeholderItem: "Judge", onChange: i => props.onAlterAssignPrizeToJudgeForm(form => (Object.assign(Object.assign({}, form), { judgeIndex: i }))) })),
        react_1.default.createElement(reactstrap_1.FormGroup, null,
            react_1.default.createElement(reactstrap_1.Label, null, `Prize`),
            react_1.default.createElement(ListSelect_1.ListSelect, { choices: props.prizes, choiceIndex: props.assignPrizeToJudgeForm.prizeIndex, placeholderItem: "Prize", onChange: i => props.onAlterAssignPrizeToJudgeForm(form => (Object.assign(Object.assign({}, form), { prizeIndex: i }))) })),
        react_1.default.createElement(reactstrap_1.Button, { disabled: !isAssignPrizeToJudgeFormValid(props.assignPrizeToJudgeForm), onClick: () => props.onSubmitAssignPrizeToJudgeForm() }, `GO`))));
;
;
function isAssignPrizeToJudgeFormValid(form) {
    return form.judgeIndex >= 0 && form.prizeIndex >= 0;
}
//# sourceMappingURL=ControlPanelPage.js.map