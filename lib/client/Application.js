"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const react_1 = __importDefault(require("react"));
/**
 * An application is a top-level React component. At any given time there should be only one Application mounted on
 * the page, and it should never be unmounted
 */
class Application extends react_1.default.Component {
    constructor(props) {
        super(props);
    }
    ready() {
    }
}
exports.Application = Application;
//# sourceMappingURL=Application.js.map