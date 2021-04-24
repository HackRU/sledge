"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingFormController = void 0;
const react_1 = __importDefault(require("react"));
const RatingForm_1 = require("./RatingForm");
class RatingFormController extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.assignment = props.ratingAssignment;
        this.state = {
            noShow: false,
            ratings: this.props.ratingAssignment.categories.map(c => -1)
        };
    }
    isValid() {
        if (this.state.noShow) {
            return true;
        }
        for (let rating of this.state.ratings) {
            if (rating <= 0 || rating > 5) {
                return false;
            }
        }
        return true;
    }
    changeRating(index, to) {
        this.setState(oldState => ({
            ratings: oldState.ratings.map((r, i) => i === index ? to : r)
        }));
    }
    submitForm() {
        this.props.onSubmit({
            noShow: this.state.noShow,
            rating: this.state.ratings.reduce((a, b) => a + b, 0),
            categoryRatings: this.state.ratings
        });
    }
    render() {
        if (this.props.ratingAssignment !== this.assignment) {
            console.warn("Sanity Check failed!");
            console.log("original", this.assignment);
            console.log("new", this.props.ratingAssignment);
        }
        return (react_1.default.createElement(RatingForm_1.RatingForm, { submissionName: this.props.ratingAssignment.submissionName, submissionURL: this.props.ratingAssignment.submissionURL, submissionLocation: this.props.ratingAssignment.submissionLocation, categories: this.props.ratingAssignment.categories.map(c => c.name), noShow: this.state.noShow, ratings: this.state.ratings, canSubmit: this.isValid(), onChangeNoShow: noShow => this.setState({ noShow }), onChangeRating: (i, r) => this.changeRating(i, r), onSubmit: () => this.submitForm() }));
    }
}
exports.RatingFormController = RatingFormController;
//# sourceMappingURL=RatingFormController.js.map