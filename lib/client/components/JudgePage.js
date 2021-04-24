"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgePage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const HeaderWithConnectionStatus_1 = require("./HeaderWithConnectionStatus");
const RatingFormController_1 = require("../components/RatingFormController");
const RankingFormController_1 = require("./RankingFormController");
const Timer_1 = __importDefault(require("./Timer/Timer"));
exports.JudgePage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "JudgePage" },
    react_1.default.createElement(HeaderWithConnectionStatus_1.HeaderWithConnectionStatus, { connectionStatus: props.connectionStatus }),
    react_1.default.createElement(JudgeSubPage, Object.assign({}, props))));
const JudgeSubPage = (props) => {
    switch (props.subPage) {
        case "JUDGE_SUBPAGE_LOADING":
            return (react_1.default.createElement(JudgePageLoading, null));
        case "JUDGE_SUBPAGE_BAD_CREDENTIALS":
            return (react_1.default.createElement(JudgePageBadCredentials, { onSegue: props.onSegue }));
        case "JUDGE_SUBPAGE_SETUP":
            return (react_1.default.createElement(JudgePageSetup, null));
        case "JUDGE_SUBPAGE_ENDED":
            return (react_1.default.createElement(JudgePageEnded, null));
        case "JUDGE_SUBPAGE_ASSIGNMENT_RATING":
            return (react_1.default.createElement("div", null,
                react_1.default.createElement(Timer_1.default, { start: Date.now() }),
                react_1.default.createElement(JudgePageAssignmentRating, { assignmentId: props.assignmentId, judgeName: props.judgeName, ratingAssignment: props.ratingAssignment, onSubmitRatingAssignment: props.onSubmitRatingAssignment })));
        case "JUDGE_SUBPAGE_ASSIGNMENT_RANKING":
            return (react_1.default.createElement("div", null,
                react_1.default.createElement(Timer_1.default, { start: Date.now() }),
                react_1.default.createElement(JudgePageAssignmentRanking, { assignmentId: props.assignmentId, judgeName: props.judgeName, rankingAssignment: props.rankingAssignment, onSubmitRankingAssignment: props.onSubmitRankingAssignment })));
        case "JUDGE_SUBPAGE_ASSIGNMENT_NONE":
            return (react_1.default.createElement(JudgePageAssignmentNone, null));
        default:
            throw new Error(`Unhandled Judge subpage ${props.subPage}`);
    }
};
const JudgePageLoading = () => (react_1.default.createElement("div", null,
    react_1.default.createElement(reactstrap_1.Card, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null,
                react_1.default.createElement("h2", null, `Loading...`)),
            react_1.default.createElement(reactstrap_1.CardText, null, `If the circle up top turns yellow or red there's something wrong with your connection.`)))));
const JudgePageBadCredentials = (props) => (react_1.default.createElement("div", null,
    react_1.default.createElement(reactstrap_1.Card, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null,
                react_1.default.createElement("h2", null, `You are not logged in.`)),
            react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onSegue("/login") }, `Go to Login Page`)))));
const JudgePageSetup = () => (react_1.default.createElement("div", null,
    react_1.default.createElement(reactstrap_1.Card, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null,
                react_1.default.createElement("h2", null, `Hang Tight! Judging hasn't started yet.`))))));
const JudgePageEnded = () => (react_1.default.createElement("div", null,
    react_1.default.createElement(reactstrap_1.Card, null,
        react_1.default.createElement(reactstrap_1.CardBody, null,
            react_1.default.createElement(reactstrap_1.CardTitle, null,
                react_1.default.createElement("h2", null, `Judging has ended.`))))));
const JudgePageAssignmentRating = (props) => (react_1.default.createElement("div", null,
    react_1.default.createElement(JudgeNameCard, { judgeName: props.judgeName }),
    react_1.default.createElement(RatingFormController_1.RatingFormController, { key: props.assignmentId, ratingAssignment: props.ratingAssignment, onSubmit: props.onSubmitRatingAssignment })));
const JudgePageAssignmentRanking = (props) => (react_1.default.createElement("div", null,
    react_1.default.createElement(JudgeNameCard, { judgeName: props.judgeName }),
    react_1.default.createElement(RankingFormController_1.RankingFormController, { key: props.assignmentId, rankingAssignment: props.rankingAssignment, onSubmit: props.onSubmitRankingAssignment })));
const JudgeNameCard = (props) => (react_1.default.createElement(reactstrap_1.Card, null,
    react_1.default.createElement(reactstrap_1.CardBody, null,
        react_1.default.createElement(reactstrap_1.CardText, null, `Hello ${props.judgeName}!`))));
const JudgePageAssignmentNone = (props) => (react_1.default.createElement(reactstrap_1.Card, null,
    react_1.default.createElement(reactstrap_1.CardBody, null,
        react_1.default.createElement(reactstrap_1.CardText, null,
            react_1.default.createElement("h2", null, `No more assignments`)))));
//# sourceMappingURL=JudgePage.js.map