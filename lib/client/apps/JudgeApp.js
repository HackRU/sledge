"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgeApp = void 0;
const react_1 = __importDefault(require("react"));
const Socket_1 = require("../Socket");
const ClientStorage_1 = require("../ClientStorage");
const JudgePage_1 = require("../components/JudgePage");
const JudgeTypes_1 = require("../JudgeTypes");
const util_1 = require("../util");
const constants_1 = require("../../shared/constants");
const Application_1 = require("../Application");
class JudgeApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.state = {
            connectionStatus: JudgeTypes_1.ConnectionStatus.Weak,
            subPage: "JUDGE_SUBPAGE_LOADING"
        };
        this.socket = new Socket_1.Socket();
        this.socket.onConnectionEvent(evt => this.handleSocketConnectionEvent(evt));
        this.judgeId = ClientStorage_1.getLoggedInJudgeId();
        this.initializePhase();
    }
    initializePhase() {
        this.socket.sendRequest({
            requestName: "REQUEST_GLOBAL_STATUS"
        }).then((res) => {
            if (res.phase === constants_1.PHASE_SETUP) {
                this.setState({ subPage: "JUDGE_SUBPAGE_SETUP" });
            }
            else if (res.phase === constants_1.PHASE_COLLECTION) {
                this.initializeJudge();
            }
            else if (res.phase === constants_1.PHASE_TALLY) {
                this.setState({ subPage: "JUDGE_SUBPAGE_END" });
            }
            else {
                throw new Error(`Bad phase ${res.phase}`);
            }
        });
    }
    initializeJudge() {
        this.socket.sendRequest({
            requestName: "REQUEST_GET_JUDGES"
        }).then((res) => {
            const myself = res.judges.find(judge => judge.id === this.judgeId);
            if (myself) {
                this.setState({ judgeName: myself.name });
                this.loadAssignment();
            }
            else {
                this.setState({ subPage: "JUDGE_SUBPAGE_BAD_CREDENTIALS" });
            }
        });
    }
    handleSocketConnectionEvent(evt) {
        if (evt === "connect") {
            this.setState({ connectionStatus: JudgeTypes_1.ConnectionStatus.Good });
        }
        else if (evt === "disconnect") {
            this.setState({ connectionStatus: JudgeTypes_1.ConnectionStatus.Weak });
        }
        else if (evt === "reconnect_failed") {
            this.setState({ connectionStatus: JudgeTypes_1.ConnectionStatus.Disconnected });
        }
    }
    loadAssignment() {
        const start = new Date().getTime();
        this.socket.sendRequest({
            requestName: "REQUEST_GET_ASSIGNMENT",
            judgeId: this.judgeId
        }).then((res) => {
            this.currentAssignment = res;
            if (res.assignmentType === constants_1.ASSIGNMENT_TYPE_RATING) {
                this.setState({
                    subPage: "JUDGE_SUBPAGE_ASSIGNMENT_RATING",
                    currentAssignmentId: res.id,
                    ratingAssignment: res.ratingAssignment,
                    startTime: start
                });
            }
            else if (res.assignmentType === constants_1.ASSIGNMENT_TYPE_RANKING) {
                this.setState({
                    subPage: "JUDGE_SUBPAGE_ASSIGNMENT_RANKING",
                    currentAssignmentId: res.id,
                    rankingAssignment: res.rankingAssignment,
                    startTime: start
                });
            }
            else if (res.assignmentType === 0) {
                this.setState({
                    subPage: "JUDGE_SUBPAGE_ASSIGNMENT_NONE",
                    currentAssignmentId: 0
                });
            }
            else {
                console.log(res);
                throw new Error(`Unhandled assignment type ${res.assignmentType}`);
            }
        });
    }
    submitRatingAssignment(form) {
        //Get current time
        const end = new Date().getTime();
        var elapsed = null;
        //Subtract the start time
        //Get start time using this.state.startTime
        if (this.state.startTime != null) {
            elapsed = end - this.state.startTime;
            elapsed = elapsed / 60000; //convert milliseconds to minutes
        }
        this.socket.sendRequest({
            requestName: "REQUEST_SUBMIT_ASSIGNMENT",
            assignmentId: this.currentAssignment.id,
            ratingAssignmentForm: form,
            //submit the calculated time
            judgetimer: elapsed
        }).then(res => {
            this.loadAssignment();
        });
    }
    submitRankingAssignment(form) {
        //Get current time
        const end = new Date().getTime();
        var elapsed = null;
        //Subtract the start time
        //Get start time using this.state.startTime
        if (this.state.startTime != null) {
            elapsed = end - this.state.startTime;
            elapsed = elapsed / 60000; //convert milliseconds to minutes
        }
        this.socket.sendRequest({
            requestName: "REQUEST_SUBMIT_ASSIGNMENT",
            assignmentId: this.currentAssignment.id,
            rankingAssignmentForm: form,
            judgetimer: elapsed
        }).then(res => {
            this.loadAssignment();
        });
    }
    getPageProps() {
        const baseProps = {
            subPage: this.state.subPage,
            connectionStatus: this.state.connectionStatus,
            onSegue: util_1.segue
        };
        if (this.state.subPage === "JUDGE_SUBPAGE_ASSIGNMENT_RATING") {
            return Object.assign(Object.assign({}, baseProps), { judgeName: this.state.judgeName, assignmentId: this.state.currentAssignmentId, ratingAssignment: this.state.ratingAssignment, onSubmitRatingAssignment: f => this.submitRatingAssignment(f) });
        }
        else if (this.state.subPage === "JUDGE_SUBPAGE_ASSIGNMENT_RANKING") {
            return Object.assign(Object.assign({}, baseProps), { judgeName: this.state.judgeName, assignmentId: this.state.currentAssignmentId, rankingAssignment: this.state.rankingAssignment, onSubmitRankingAssignment: f => this.submitRankingAssignment(f) });
        }
        else {
            return baseProps;
        }
    }
    render() {
        return react_1.default.createElement(JudgePage_1.JudgePage, this.getPageProps());
    }
}
exports.JudgeApp = JudgeApp;
//# sourceMappingURL=JudgeApp.js.map