"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButtonGroup = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
exports.RadioButtonGroup = (props) => (react_1.default.createElement(reactstrap_1.ButtonGroup, { size: props.size, style: { width: "100%" } }, props.options.map((option, i) => (react_1.default.createElement(reactstrap_1.Button, { key: i, active: option.value === props.value, color: option.value === props.value ? "primary" : "secondary", disabled: !!props.disabled, onClick: () => props.onChange(option.value) }, option.label)))));
//# sourceMappingURL=RadioButtonGroup.js.map