"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSelect = void 0;
const react_1 = __importDefault(require("react"));
const react_select_1 = __importDefault(require("react-select"));
exports.ListSelect = (props) => (react_1.default.createElement(react_select_1.default, { value: props.choiceIndex < 0 ?
        { value: -1, label: `[Select a ${props.placeholderItem}]` } :
        { value: props.choiceIndex, label: props.choices[props.choiceIndex] }, options: props.choices.map((label, value) => ({ label, value })), onChange: (v, t) => t.action === "select-option" && props.onChange(v.value) }));
;
//# sourceMappingURL=ListSelect.js.map