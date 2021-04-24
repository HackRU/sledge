"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlPanelApp = void 0;
const react_1 = __importDefault(require("react"));
const ControlPanelPage_1 = require("../components/ControlPanelPage");
const GetFullScoresRequestTypes_1 = require("../../shared/GetFullScoresRequestTypes");
const Socket_1 = require("../Socket");
const Application_1 = require("../Application");
class ControlPanelApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.socket = new Socket_1.Socket();
        this.state = {
            fullScores: GetFullScoresRequestTypes_1.getPlaceholderFullScoresResponseData(),
            assignPrizeToJudgeForm: {
                judgeIndex: -1,
                prizeIndex: -1
            }
        };
        this.socket.sendRequest({
            requestName: "REQUEST_GET_FULL_SCORES"
        }).then((res) => {
            this.setState({
                fullScores: res
            });
        });
    }
    getPageProps() {
        return {
            judges: this.state.fullScores.judges.map(j => `${j.name} (ID: ${j.id})`),
            prizes: this.state.fullScores.prizes.map(p => `${p.name} (ID: ${p.id})`),
            assignPrizeToJudgeForm: this.state.assignPrizeToJudgeForm,
            onAlterAssignPrizeToJudgeForm: f => this.setState(oldState => ({
                assignPrizeToJudgeForm: f(oldState.assignPrizeToJudgeForm)
            })),
            onSubmitAssignPrizeToJudgeForm: () => {
                this.socket.sendRequest({
                    requestName: "REQUEST_ASSIGN_PRIZE_TO_JUDGE",
                    judgeId: this.state.fullScores.judges[this.state.assignPrizeToJudgeForm.judgeIndex].id,
                    prizeId: this.state.fullScores.prizes[this.state.assignPrizeToJudgeForm.prizeIndex].id
                });
                this.setState({ assignPrizeToJudgeForm: { judgeIndex: -1, prizeIndex: -1 } });
            }
        };
    }
    render() {
        return react_1.default.createElement(ControlPanelPage_1.ControlPanelPage, this.getPageProps());
    }
}
exports.ControlPanelApp = ControlPanelApp;
//# sourceMappingURL=ControlPanelApp.js.map