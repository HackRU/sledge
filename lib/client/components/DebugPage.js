"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDebugFormController = exports.EventDebugForm = exports.DebugPage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const Socket_1 = require("../Socket");
const util_1 = require("../../shared/util");
exports.DebugPage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "DebugPage" },
    react_1.default.createElement("h1", null, `Debug Events`),
    react_1.default.createElement(EventDebugFormController, Object.assign({}, props))));
;
exports.EventDebugForm = (props) => (react_1.default.createElement("form", null,
    react_1.default.createElement(reactstrap_1.Input, { type: "textarea", value: props.eventJsonValue, onChange: evt => props.onChangeEventJson(evt.target.value) }),
    react_1.default.createElement("div", null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onSendRequest() }, `Send`)),
    react_1.default.createElement("span", null, `Templates:`),
    react_1.default.createElement(reactstrap_1.ButtonGroup, null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onLoadTemplate("status"), disabled: !props.templatesReady }, `Global Status`),
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onLoadTemplate("beginJudging"), disabled: !props.templatesReady }, `Begin Judging`),
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onLoadTemplate("samplePopulate"), disabled: !props.templatesReady }, `Load Sample Populate Data`)),
    react_1.default.createElement("h2", null, `Response`),
    react_1.default.createElement(reactstrap_1.Input, { type: "textarea", readOnly: true, value: props.response })));
;
class EventDebugFormController extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            eventJson: "",
            response: ""
        };
    }
    sendRequest() {
        let obj = util_1.catchOnly("SyntaxError", () => JSON.parse(this.state.eventJson));
        if (obj instanceof Error) {
            this.setState({ response: obj.message });
        }
        Socket_1.getSocket().sendDebug(obj).then(res => {
            let json = JSON.stringify(res);
            this.setState({ response: json });
        });
    }
    loadTemplate(name) {
        let json = this.props.templates.get(name);
        if (typeof json != "string") {
            throw new Error(`No template ${name}!`);
        }
        this.setState({
            eventJson: json
        });
    }
    changeEventJson(newJson) {
        this.setState({
            eventJson: newJson
        });
    }
    render() {
        return (react_1.default.createElement(exports.EventDebugForm, { eventJsonValue: this.state.eventJson, response: this.state.response, templatesReady: this.props.templatesReady, onSendRequest: () => this.sendRequest(), onLoadTemplate: (name) => this.loadTemplate(name), onChangeEventJson: (newJson) => this.changeEventJson(newJson) }));
    }
}
exports.EventDebugFormController = EventDebugFormController;
;
//# sourceMappingURL=DebugPage.js.map