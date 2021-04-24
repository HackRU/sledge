"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingFormController = void 0;
const react_1 = __importDefault(require("react"));
const RankingForm_1 = require("./RankingForm");
class RankingFormController extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            chosenIndexes: []
        };
    }
    getRenderSubmissions() {
        return this.props.rankingAssignment.submissions.map((s, i) => ({
            name: s.name,
            rank: this.state.chosenIndexes.indexOf(i) + 1
        }));
    }
    isValid() {
        return this.state.chosenIndexes.length === 3;
    }
    selectSubmission(index) {
        this.setState(oldState => ({
            chosenIndexes: [...oldState.chosenIndexes, index]
        }));
    }
    clearChoices() {
        this.setState({
            chosenIndexes: []
        });
    }
    submit() {
        this.props.onSubmit({
            topSubmissionIds: this.state.chosenIndexes.map(idx => this.props.rankingAssignment.submissions[idx].id)
        });
    }
    render() {
        return (react_1.default.createElement(RankingForm_1.RankingForm, { prizeName: this.props.rankingAssignment.prizeName, submissions: this.getRenderSubmissions(), canRankMore: !this.isValid(), canSubmit: this.isValid(), onSelectSubmission: index => this.selectSubmission(index), onClear: () => this.clearChoices(), onSubmit: () => this.submit() }));
    }
}
exports.RankingFormController = RankingFormController;
//# sourceMappingURL=RankingFormController.js.map