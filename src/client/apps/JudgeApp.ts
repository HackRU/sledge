import React from "react";
import {Socket} from "../Socket";

import {ClientStorage} from "../ClientStorage";
import {JudgePage, JudgePageProps} from "../components/JudgePage";
import {ConnectionStatus} from "../JudgeTypes";
import {GetJudgesResponseData} from "../../shared/GetJudgesRequestTypes";
import {GlobalStatusResponseData} from "../../shared/GlobalStatusRequestTypes";
import {RatingAssignmentForm, RankingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";
import {
  GetAssignmentResponseData,
  RatingAssignment,
  RankingAssignment
} from "../../shared/GetAssignmentRequestTypes";
import {
  PHASE_SETUP,
  PHASE_COLLECTION,
  PHASE_TALLY,
  ASSIGNMENT_TYPE_RATING,
  ASSIGNMENT_TYPE_RANKING
} from "../../shared/constants";

export class JudgeApp extends React.Component<any, JudgeAppState> {
  socket: Socket;
  clientStorage: ClientStorage;

  judgeId: number;
  currentAssignment?: GetAssignmentResponseData;

  constructor(props: any) {
    super(props);

    this.state = {
      connectionStatus: ConnectionStatus.Weak,
      subPage: "JUDGE_SUBPAGE_LOADING"
    };

    this.socket = new Socket();
    this.socket.onConnectionEvent(evt => {
      if (evt === "connect")
        this.setState({connectionStatus: ConnectionStatus.Good});
      if (evt === "disconnect")
        this.setState({connectionStatus: ConnectionStatus.Weak});
      if (evt === "reconnect_failed")
        this.setState({connectionStatus: ConnectionStatus.Disconnected});
    });

    this.clientStorage = new ClientStorage();
    this.judgeId = this.clientStorage.getJudgeId();

    Promise.all([
      this.socket.sendRequest({requestName: "REQUEST_GET_JUDGES"}),
      this.socket.sendRequest({requestName: "REQUEST_GLOBAL_STATUS"})
    ]).then(([judgesRes, statusRes]: [GetJudgesResponseData, GlobalStatusResponseData]) => {
      let myself = judgesRes.judges.find(judge => judge.id === this.judgeId);
      if (!myself) {
        this.setState({subPage: "JUDGE_SUBPAGE_BAD_CREDENTIALS"});
      } else if (statusRes.phase === PHASE_SETUP) {
        this.setState({subPage: "JUDGE_SUBPAGE_SETUP"});
      } else if (statusRes.phase === PHASE_COLLECTION) {
        this.loadAssignment();
      } else if (statusRes.phase === PHASE_TALLY) {
        this.setState({subPage: "JUDGE_SUBPAGE_END"});
      } else {
        throw new Error(`Unhandled phase ${statusRes.phase}`);
      }
    });
  }

  loadAssignment() {
    this.socket.sendRequest({
      requestName: "REQUEST_GET_ASSIGNMENT",
      judgeId: this.judgeId
    }).then((res: GetAssignmentResponseData) => {
      if (res.assignmentType === ASSIGNMENT_TYPE_RATING) {
        this.currentAssignment = res;
        this.setState({
          subPage: "JUDGE_SUBPAGE_ASSIGNMENT_RATING",
          ratingAssignment: res.ratingAssignment,
          ratingAssignmentForm: {
            noShow: false,
            categoryRatings: res.ratingAssignment.categories.map(x => 0),
            rating: 0
          }
        });
      } else if (res.assignmentType === ASSIGNMENT_TYPE_RANKING) {
        this.currentAssignment = res;
        this.setState({
          subPage: "JUDGE_SUBPAGE_ASSIGNMENT_RANKING",
          rankingAssignment: res.rankingAssignment,
          rankingAssignmentForm: {
            topSubmissionIds: []
          }
        });
      } else {
        console.log(res);
        throw new Error(`Unhandled assignment type ${res.assignmentType}`);
      }
    });
  }

  submitAssignment() {
    if (this.state.subPage === "JUDGE_SUBPAGE_ASSIGNMENT_RATING") {
      this.socket.sendRequest({
        requestName: "REQUEST_SUBMIT_ASSIGNMENT",
        assignmentId: this.currentAssignment.id,
        ratingAssignmentForm: this.state.ratingAssignmentForm
      }).then(res => {
        this.loadAssignment();
      });
    } else if (this.state.subPage === "JUDGE_SUBPAGE_ASSIGNMENT_RANKING") {
      this.socket.sendRequest({
        requestName: "REQUEST_SUBMIT_ASSIGNMENT",
        assignmentId: this.currentAssignment.id,
        rankingAssignmentForm: this.state.rankingAssignmentForm
      }).then(res => {
        this.loadAssignment();
      });
    } else {
      throw new Error(`Unknown Judge subpage ${this.state.subPage}`);
    }
  }

  getPageProps(): JudgePageProps {
    return {
      connectionStatus: this.state.connectionStatus,
      subPage: this.state.subPage,
      ratingAssignment: this.state.ratingAssignment,
      ratingAssignmentForm: this.state.ratingAssignmentForm,
      rankingAssignment: this.state.rankingAssignment,
      rankingAssignmentForm: this.state.rankingAssignmentForm,

      onSegue: to => {window.location.hash = to;},
      onAlterRatingAssignmentForm: f => {
        this.setState(oldState => ({ratingAssignmentForm: f(oldState.ratingAssignmentForm)}))
      },
      onSubmitRatingAssignmentForm: () => this.submitAssignment(),
      onAlterRankingAssignmentForm: f => {
        this.setState(oldState => ({rankingAssignmentForm: f(oldState.rankingAssignmentForm)}))
      },
      onSubmitRankingAssignmentForm: () => this.submitAssignment()
    };
  }

  render() {
    return React.createElement(
      JudgePage,
      this.getPageProps()
    );
  }
}

interface JudgeAppState {
  connectionStatus: ConnectionStatus;
  judgeName?: string;
  subPage: string;

  ratingAssignment?: RatingAssignment;
  ratingAssignmentForm?: RatingAssignmentForm;

  rankingAssignment?: RankingAssignment;
  rankingAssignmentForm?: RankingAssignmentForm;
}
