"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizePrizesApp = void 0;
const react_1 = __importDefault(require("react"));
const VisualizePrizesPage_1 = require("../components/VisualizePrizesPage");
const GetFullScoresRequestTypes_1 = require("../../shared/GetFullScoresRequestTypes");
const Socket_1 = require("../Socket");
const Application_1 = require("../Application");
class VisualizePrizesApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.state = {
            response: GetFullScoresRequestTypes_1.getPlaceholderFullScoresResponseData()
        };
        this.socket = new Socket_1.Socket();
        this.socket.sendRequest({
            requestName: "REQUEST_GET_FULL_SCORES"
        }).then((response) => {
            console.log(response);
            this.setState({ response });
        });
    }
    getPageProps() {
        return {
            judges: judgeNamesFromResponse(this.state.response),
            prizeTables: prizeTablesFromResponse(this.state.response)
        };
    }
    render() {
        return react_1.default.createElement(VisualizePrizesPage_1.VisualizePrizesPage, this.getPageProps());
    }
}
exports.VisualizePrizesApp = VisualizePrizesApp;
function judgeNamesFromResponse(res) {
    return res.judges.map(j => j.name);
}
function prizeTablesFromResponse(res) {
    const statusMap = res.submissions.map(sub => res.judges.map(j => []));
    // Initialize prize tables and populate submissionIndexStatuses map
    const prizeTables = [];
    for (let i = 0; i < res.prizes.length; i++) {
        const prize = res.prizes[i];
        const statuses = res.judges.map(j => []);
        for (let eligibleSubmissionIndex of prize.eligibleSubmissions) {
            for (let j = 0; j < res.judges.length; j++) {
                const statusObj = {
                    status: "JSSTATUS_NONE"
                };
                statuses[j].push(statusObj);
                statusMap[eligibleSubmissionIndex][j].push({
                    prizeIndex: i,
                    statusObj
                });
            }
        }
        prizeTables.push({
            name: prize.name,
            locations: prize.eligibleSubmissions.map(submissionIndex => res.submissions[submissionIndex].location),
            statuses
        });
    }
    for (let ass of res.assignments) {
        if (ass.type === 1) {
            const statuses = statusMap[ass.submissionIndex][ass.judgeIndex];
            for (let status of statuses) {
                status.statusObj.status = ass.active ? "JSSTATUS_ACTIVE" : (ass.noShow ? "JSSTATUS_NOSHOW" : "JSSTATUS_COMPLETE");
            }
        }
    }
    console.log(prizeTables);
    return prizeTables;
}
//# sourceMappingURL=VisualizePrizesApp.js.map