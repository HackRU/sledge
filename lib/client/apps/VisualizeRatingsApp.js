"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizeRatingsApp = void 0;
const react_1 = __importDefault(require("react"));
const VisualizeRatingsPage_1 = require("../components/VisualizeRatingsPage");
const Socket_1 = require("../Socket");
const Application_1 = require("../Application");
class VisualizeRatingsApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.state = {
            lastUpdateTimestamp: 0,
            lastResponse: {
                submissions: [],
                judges: [],
                scores: []
            }
        };
        this.socket = new Socket_1.Socket();
        this.loadVisualization();
    }
    loadVisualization() {
        this.socket.sendRequest({
            requestName: "REQUEST_GET_RATING_SCORES"
        }).then((response) => {
            this.setState({
                lastUpdateTimestamp: Date.now(),
                lastResponse: response
            });
        });
    }
    getPageProps() {
        return {
            response: this.state.lastResponse,
            timestamp: this.state.lastUpdateTimestamp,
            onReload: () => this.loadVisualization()
        };
    }
    render() {
        return react_1.default.createElement(VisualizeRatingsPage_1.VisualizeRatingsPage, this.getPageProps());
    }
}
exports.VisualizeRatingsApp = VisualizeRatingsApp;
//# sourceMappingURL=VisualizeRatingsApp.js.map