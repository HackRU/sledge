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
exports.TabularActions = void 0;
const React = __importStar(require("react"));
const reactstrap_1 = require("reactstrap");
const TabularActionsRow = (props) => (React.createElement("tr", { key: props.index },
    props.columns.map((c, i) => (React.createElement("td", { key: i }, c))),
    props.actions.length > 0 && (React.createElement("td", { key: "actions" },
        React.createElement(reactstrap_1.ButtonGroup, null, props.actions.map((a, i) => (React.createElement(reactstrap_1.Button, { key: i, onClick: () => a.cb(props.index) }, a.name))))))));
exports.TabularActions = (props) => (React.createElement(reactstrap_1.Table, { hover: true },
    React.createElement("thead", null,
        React.createElement("tr", null,
            props.headings.map((h, i) => (React.createElement("th", { key: i }, h))),
            props.actions.length > 0 && (React.createElement("th", null, `Actions`)))),
    React.createElement("tbody", null, props.data.map((columns, i) => (React.createElement(TabularActionsRow, { key: i, actions: props.actions, columns: columns, index: i }))))));
//# sourceMappingURL=TabularActions.js.map