"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugApp = void 0;
const react_1 = __importDefault(require("react"));
const Socket_1 = require("../Socket");
const DebugPage_1 = require("../components/DebugPage");
const Application_1 = require("../Application");
class DebugApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.socket = new Socket_1.Socket();
        window.socket = this.socket;
        this.state = {
            templatesReady: false
        };
        this.loadTemplates();
        this.templates = new Map([
            ["status", "{\"requestName\": \"REQUEST_GLOBAL_STATUS\"}"],
            ["beginJudging", "{\"requestName\": \"REQUEST_BEGIN_JUDGING\"}"]
        ]);
    }
    loadTemplates() {
        let that = this;
        const xhr = new XMLHttpRequest();
        const outsideThis = this;
        xhr.addEventListener("load", function () {
            const templateData = JSON.parse(this.responseText);
            const keys = Object.keys(templateData);
            for (let key of keys) {
                if (!outsideThis.templates.has(key)) {
                    outsideThis.templates.set(key, JSON.stringify(templateData[key]));
                }
            }
            that.setState({ templatesReady: true });
        });
        xhr.open("GET", "/templates.json");
        xhr.send();
    }
    getPageProps() {
        return {
            templatesReady: this.state.templatesReady,
            templates: this.templates
        };
    }
    render() {
        return react_1.default.createElement(DebugPage_1.DebugPage, this.getPageProps());
    }
}
exports.DebugApp = DebugApp;
//# sourceMappingURL=DebugApp.js.map