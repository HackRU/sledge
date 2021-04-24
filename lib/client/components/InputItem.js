"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputItem = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
class InputItem extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: this.props.fields.map(x => "")
        };
    }
    dispatchAdd() {
        this.setState(prevState => ({
            values: prevState.values.map(x => "")
        }));
        this.props.onAdd(this.state.values);
    }
    render() {
        let inputs = this.props.fields.map((field, i) => (react_1.default.createElement(reactstrap_1.Input, { placeholder: field, onChange: evt => {
                let newVal = evt.target.value;
                this.setState(prevState => ({
                    values: setArray(prevState.values, i, newVal)
                }));
            }, onKeyPress: evt => {
                if (evt.ctrlKey && evt.key === "Enter") {
                    this.dispatchAdd();
                }
            }, value: this.state.values[i], key: i + "|" + field })));
        return (react_1.default.createElement(reactstrap_1.InputGroup, null,
            react_1.default.createElement(reactstrap_1.InputGroupAddon, { addonType: "prepend" }, this.props.name),
            inputs,
            react_1.default.createElement(reactstrap_1.InputGroupAddon, { addonType: "append" },
                react_1.default.createElement(reactstrap_1.Button, { onClick: () => this.dispatchAdd() }, `GO`))));
    }
}
exports.InputItem = InputItem;
function setArray(arr, index, newVal) {
    let newArray = arr.map(x => x);
    newArray[index] = newVal;
    return newArray;
}
//# sourceMappingURL=InputItem.js.map