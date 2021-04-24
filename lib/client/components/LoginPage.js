"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
;
exports.LoginPage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "LoginPage" },
    react_1.default.createElement("h1", null, `Login`),
    react_1.default.createElement(reactstrap_1.ListGroup, null,
        react_1.default.createElement(reactstrap_1.ListGroupItem, { color: props.loading ? "danger" : "info" },
            react_1.default.createElement(reactstrap_1.ListGroupItemHeading, null, `Select Judge`),
            props.loading && (react_1.default.createElement(reactstrap_1.ListGroupItemText, null, `Loading...`))),
        props.judges.map((j, i) => (react_1.default.createElement(reactstrap_1.ListGroupItem, { key: i, tag: "button", onClick: () => props.onSelectJudge(j.id) }, j.name))))));
//# sourceMappingURL=LoginPage.js.map