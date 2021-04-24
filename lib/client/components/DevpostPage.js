"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevpostPage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const TextSubmit_1 = require("./TextSubmit");
const Devpost_1 = require("../Devpost");
exports.DevpostPage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "DevpostPage" },
    react_1.default.createElement("h1", null, `Import Submission Data from Devpost`),
    react_1.default.createElement(TextSubmit_1.TextSubmit, { onChange: props.onImport }),
    react_1.default.createElement("div", null,
        react_1.default.createElement("p", null,
            `Status: `,
            react_1.default.createElement("em", null, props.status))),
    react_1.default.createElement("div", null,
        react_1.default.createElement("span", null, `Download a `),
        react_1.default.createElement("a", { href: Devpost_1.TEST_CSV_URL }, `test CSV`),
        react_1.default.createElement("span", null, `.`))));
;
//# sourceMappingURL=DevpostPage.js.map