import React from "react";

import {RatingForm} from "./RatingForm";
import {RatingAssignment} from "../../shared/GetAssignmentRequestTypes";
import {RatingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";

export class RatingFormController extends React.Component<RatingFormControllerProps, RatingFormControllerState> {
  assignment: RatingAssignment;

  constructor(props: RatingFormControllerProps) {
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

  changeRating(index: number, to: number) {
    this.setState(oldState => ({
      ratings: oldState.ratings.map(
        (r,i) => i===index ? to : r
      )
    }));
  }

  submitForm() {
    this.props.onSubmit({
      noShow: this.state.noShow,
      rating: this.state.ratings.reduce((a,b) => a+b, 0),
      categoryRatings: this.state.ratings
    });
  }

  render() {
    if (this.props.ratingAssignment !== this.assignment) {
      console.warn("Sanity Check failed!")
      console.log("original", this.assignment);
      console.log("new", this.props.ratingAssignment);
    }

    return (
      <RatingForm
        submissionName={this.props.ratingAssignment.submissionName}
        submissionURL={this.props.ratingAssignment.submissionURL}
        submissionLocation={this.props.ratingAssignment.submissionLocation}
        categories={this.props.ratingAssignment.categories.map(c => c.name)}

        noShow={this.state.noShow}
        ratings={this.state.ratings}
        canSubmit={this.isValid()}

        onChangeNoShow={noShow => this.setState({noShow})}
        onChangeRating={(i,r) => this.changeRating(i,r)}
        onSubmit={() => this.submitForm()}
      />
    );
  }
}

export interface RatingFormControllerProps {
  ratingAssignment: RatingAssignment;
  onSubmit: (form: RatingAssignmentForm) => void;
}

interface RatingFormControllerState {
  noShow: boolean;
  ratings: Array<number>;
}
