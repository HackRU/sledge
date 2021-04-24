"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardSection = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
exports.CardSection = (props) => (react_1.default.createElement(reactstrap_1.Card, { style: { margin: "15px 0px", padding: "10px" } }, props.children));
//# sourceMappingURL=CardSection.js.map