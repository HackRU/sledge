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
exports.TextSubmit = void 0;
const React = __importStar(require("react"));
const reactstrap_1 = require("reactstrap");
class TextSubmit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            textValue: ""
        };
    }
    onChange(evt) {
        this.setState({ textValue: evt.target.value });
    }
    handleKeyPress(evt) {
        if (evt.ctrlKey && evt.key === "Enter") {
            this.submit();
        }
    }
    submit() {
        this.props.onChange(this.state.textValue);
    }
    render() {
        return (React.createElement(reactstrap_1.Form, null,
            React.createElement(reactstrap_1.InputGroup, null,
                React.createElement(reactstrap_1.Input, { type: "textarea", onChange: evt => this.onChange(evt), onKeyPress: evt => this.handleKeyPress(evt), value: this.state.textValue }),
                React.createElement(reactstrap_1.InputGroupAddon, { addonType: "append" },
                    React.createElement(reactstrap_1.Button, { onClick: () => this.submit() }, `GO`)))));
    }
}
exports.TextSubmit = TextSubmit;
//# sourceMappingURL=TextSubmit.js.map