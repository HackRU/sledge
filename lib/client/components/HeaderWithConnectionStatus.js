"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderWithConnectionStatus = void 0;
const react_1 = __importDefault(require("react"));
const JudgeTypes_1 = require("../JudgeTypes");
exports.HeaderWithConnectionStatus = (props) => (react_1.default.createElement("header", { className: "masthead", style: { margin: "15px 30px" } },
    react_1.default.createElement("div", { className: "inner" },
        react_1.default.createElement("h1", { className: "masthead-brand", style: { display: "inline", verticalAlign: "baseline" } }, `Sledge`),
        react_1.default.createElement("svg", { viewBox: "0 0 100 100", height: "35", width: "35", style: { display: "inline", verticalAlign: "baseline" } },
            react_1.default.createElement("circle", { cx: "50", cy: "50", r: "50", fill: getConnectionStatusColor(props.connectionStatus) })))));
function getConnectionStatusColor(status) {
    switch (status) {
        case JudgeTypes_1.ConnectionStatus.Good:
            return "green";
        case JudgeTypes_1.ConnectionStatus.Weak:
            return "yellow";
        case JudgeTypes_1.ConnectionStatus.Disconnected:
            return "red";
        default:
            throw new Error(`Unhandled ConnectionStatus ${status}`);
    }
}
//# sourceMappingURL=HeaderWithConnectionStatus.js.map