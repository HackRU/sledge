"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionManagementApp = void 0;
const react_1 = __importDefault(require("react"));
const SubmissionManagementPage_1 = require("../components/SubmissionManagementPage");
const GetFullScoresRequestTypes_1 = require("../../shared/GetFullScoresRequestTypes");
const Socket_1 = require("../Socket");
const Application_1 = require("../Application");
class SubmissionManagementApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.state = {
            response: GetFullScoresRequestTypes_1.getPlaceholderFullScoresResponseData()
        };
        this.socket = new Socket_1.Socket();
        this.socket.sendRequest({
            requestName: "REQUEST_GET_FULL_SCORES"
        }).then((response) => {
            this.setState({ response });
        });
    }
    getPageProps() {
        const ratingInfo = getRatingInformation(this.state.response);
        return {
            submissions: this.state.response.submissions.map((sub, i) => {
                return {
                    location: sub.location,
                    name: sub.name,
                    track: this.state.response.tracks[sub.trackIndex].name,
                    averageRating: ratingInfo[i].averageScore,
                    normalizedRating: ratingInfo[i].judgeNormalizedAverage
                };
            })
        };
    }
    render() {
        return react_1.default.createElement(SubmissionManagementPage_1.SubmissionManagementPage, this.getPageProps());
    }
}
exports.SubmissionManagementApp = SubmissionManagementApp;
function getRatingInformation(response) {
    const normalizationFactors = calculateJudgeNormalizationFactors(response);
    const rawScores = response.submissions.map(s => []);
    const normalizedScores = response.submissions.map(s => []);
    const activeAssignments = response.submissions.map(s => 0);
    for (let ass of response.assignments) {
        if (ass.type === 1) {
            if (!ass.active && !ass.noShow) {
                rawScores[ass.submissionIndex].push(ass.rating);
                normalizedScores[ass.submissionIndex].push(normalizationFactors[ass.judgeIndex] * ass.rating);
            }
            else {
                activeAssignments[ass.submissionIndex]++;
            }
        }
    }
    return response.submissions.map((sub, i) => {
        const totalCompletedRatings = rawScores[i].length;
        const totalScore = rawScores[i].reduce((a, b) => a + b, 0);
        const averageScore = totalScore > 0 ? totalScore / totalCompletedRatings : 0;
        const judgeNormalizedTotal = normalizedScores[i].reduce((a, b) => a + b, 0);
        const judgeNormalizedAverage = judgeNormalizedTotal > 0 ? judgeNormalizedTotal / totalCompletedRatings : 0;
        return {
            totalScore,
            averageScore,
            judgeNormalizedAverage,
            totalCompletedRatings
        };
    });
}
function calculateJudgeNormalizationFactors(response) {
    const judgeScores = response.judges.map(j => []);
    for (let ass of response.assignments) {
        if (ass.type === 1) {
            if (!ass.active) {
                judgeScores[ass.judgeIndex].push(ass.rating);
            }
        }
    }
    return judgeScores.map((scores) => {
        const sum = scores.reduce((a, b) => a + b, 0);
        if (sum === 0) {
            return 0;
        }
        else {
            return 20 * scores.length / sum;
        }
    });
}
//# sourceMappingURL=SubmissionManagementApp.js.map