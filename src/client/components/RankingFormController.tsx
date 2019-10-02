import React from "react";

import {RankingForm} from "./RankingForm";

import {RankingAssignment} from "../../shared/GetAssignmentRequestTypes";
import {RankingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";

export class RankingFormController extends React.Component<RankingFormControllerProps,
RankingFormControllerState> {
  constructor(props) {
    super(props);

    this.state = {
      chosenIndexes: []
    };
  }

  getRenderSubmissions(): Array<{name: string, rank: number}> {
    return this.props.rankingAssignment.submissions.map((s, i) => ({
      name: s.name,
      rank: this.state.chosenIndexes.indexOf(i) + 1
    }));
  }

  isValid() {
    return this.state.chosenIndexes.length === 3;
  }

  selectSubmission(index: number) {
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
      topSubmissionIds: this.state.chosenIndexes.map(
        idx => this.props.rankingAssignment.submissions[idx].id
      )
    });
  }

  render() {
    return (
      <RankingForm
        prizeName={this.props.rankingAssignment.prizeName}
        submissions={this.getRenderSubmissions()}
        canRankMore={!this.isValid()}
        canSubmit={this.isValid()}

        onSelectSubmission={index => this.selectSubmission(index)}
        onClear={() => this.clearChoices()}
        onSubmit={() => this.submit()}
      />
    );
  }
}

export interface RankingFormControllerProps {
  rankingAssignment: RankingAssignment;
  onSubmit: (f: RankingAssignmentForm) => void;
}

interface RankingFormControllerState {
  chosenIndexes: Array<number>;
}
