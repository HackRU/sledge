"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRouteApp = void 0;
const react_1 = __importDefault(require("react"));
const directory_1 = require("../directory");
const BadRoutePage_1 = require("../components/BadRoutePage");
const Application_1 = require("../Application");
/**
 * This will render when we get a route that doesn't exist
 */
class BadRouteApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.pageHash = document.location.hash;
    }
    render() {
        return react_1.default.createElement(BadRoutePage_1.BadRoutePage, {
            currentHash: this.props.originalHash,
            pages: directory_1.pages
        });
    }
}
exports.BadRouteApp = BadRouteApp;
//# sourceMappingURL=BadRouteApp.js.map