"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRoutePage = void 0;
const React = __importStar(require("react"));
const reactstrap_1 = require("reactstrap");
exports.BadRoutePage = ({ pages, currentHash }) => (React.createElement(reactstrap_1.Container, { id: "BadRouteApp" },
    React.createElement("h1", null, `Bad Route`),
    React.createElement("p", null,
        `The page you are looking for, `,
        React.createElement("em", null, currentHash),
        `, does note exist.`),
    React.createElement("p", null, `Here is a list of valid routes:`),
    React.createElement("ul", null, pages.map(page => (React.createElement("li", null,
        React.createElement("a", { href: `/${page.canonical}` }, page.canonical)))))));
//# sourceMappingURL=BadRoutePage.js.map