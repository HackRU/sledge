"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverallRatingsApp = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const Socket_1 = require("../Socket");
const Application_1 = require("../Application");
const constants_1 = require("../../shared/constants");
const recharts_1 = require("recharts");
class OverallRatingsApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.state = {
            status: "LOADING"
        };
        this.socket = Socket_1.getSocket();
    }
    ready() {
        this.socket.sendRequest({
            requestName: "REQUEST_GET_FULL_SCORES"
        }).then((res) => {
            this.setState({
                status: "READY",
                response: res
            });
        });
    }
    render() {
        return (react_1.default.createElement(reactstrap_1.Container, { id: "OverallRatingsPage" },
            react_1.default.createElement("h1", null, `Overall Ratings`),
            this.state.status === "READY" && (react_1.default.createElement(OverallRatingsBarChart, { data: getAvgOverall(this.state.response) })),
            this.state.status === "READY" && (react_1.default.createElement(OverallRatingsTable, { data: getAvgOverall(this.state.response) })),
            this.state.status === "LOADING" && (react_1.default.createElement("div", null,
                react_1.default.createElement("p", null, "Loading...")))));
    }
}
exports.OverallRatingsApp = OverallRatingsApp;
const OverallRatingsBarChart = (props) => (react_1.default.createElement(recharts_1.BarChart, { width: 1000, height: 500, data: props.data },
    react_1.default.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
    react_1.default.createElement(recharts_1.XAxis, { dataKey: "name" }),
    react_1.default.createElement(recharts_1.YAxis, null),
    react_1.default.createElement(recharts_1.Tooltip, null),
    react_1.default.createElement(recharts_1.Legend, null),
    react_1.default.createElement(recharts_1.Bar, { dataKey: "average" })));
const OverallRatingsTable = (props) => (react_1.default.createElement("table", null,
    react_1.default.createElement("thead", null,
        react_1.default.createElement("tr", null,
            react_1.default.createElement("th", null, "Location"),
            react_1.default.createElement("th", null, "Score"),
            react_1.default.createElement("th", null, "Name"))),
    react_1.default.createElement("tbody", null, props.data.map(s => (react_1.default.createElement("tr", null,
        react_1.default.createElement("td", null, s.location),
        react_1.default.createElement("td", null, s.average),
        react_1.default.createElement("td", null, s.name)))))));
function getAvgOverall(data) {
    // Initialize the sum and count to 0 for each submission
    let sumCount = data.submissions.map(_s => ({
        sum: 0,
        count: 0
    }));
    // Considering only inactive rating assignments, add up the total
    // and sum of ratings
    for (let asm of data.assignments) {
        if (asm.type === constants_1.ASSIGNMENT_TYPE_RATING && !asm.active) {
            sumCount[asm.submissionIndex].sum += asm.rating;
            sumCount[asm.submissionIndex].count++;
        }
    }
    // Return the name of each submission with the calculated average, or slightly
    // negative if unrated
    return sumCount.map((sc, i) => ({
        name: data.submissions[i].name,
        average: sc.count > 0 ? sc.sum / sc.count : -.01,
        location: data.submissions[i].location,
        index: i
    })).sort((a, b) => {
        return data.submissions[a.index].location - data.submissions[b.index].location;
    });
}
//# sourceMappingURL=OverallRatingsApp.js.map