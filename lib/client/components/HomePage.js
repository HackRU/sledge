"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomePage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
exports.HomePage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "HomePage" },
    react_1.default.createElement("h1", null, `Sledge`),
    react_1.default.createElement(reactstrap_1.Card, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null,
                react_1.default.createElement("h2", null, `Welcome to Sledge!`)),
            react_1.default.createElement("div", { style: { margin: "10px" } },
                react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onSegue("/login") }, `Login`)),
            react_1.default.createElement("div", { style: { margin: "10px" } },
                react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onSegue("/judge") }, `Start Judging!`))))));
;
//# sourceMappingURL=HomePage.js.map