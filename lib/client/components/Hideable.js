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
exports.Hideable = void 0;
const React = __importStar(require("react"));
const reactstrap_1 = require("reactstrap");
class Hideable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: !!this.props.initiallyHidden
        };
    }
    render() {
        let currentlyHidden = this.state.hidden;
        return (React.createElement("div", null,
            React.createElement(reactstrap_1.ButtonGroup, null,
                React.createElement(reactstrap_1.Button, { onClick: () => this.setState({ hidden: !currentlyHidden }) }, `Show/Hide`)),
            this.state.hidden ? [] : this.props.children));
    }
}
exports.Hideable = Hideable;
//# sourceMappingURL=Hideable.js.map