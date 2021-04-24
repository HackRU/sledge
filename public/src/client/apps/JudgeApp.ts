import React from "react";
import {Socket} from "../Socket";

import {getLoggedInJudgeId} from "../ClientStorage";
import {JudgePage, JudgePageProps} from "../components/JudgePage";
import {ConnectionStatus} from "../JudgeTypes";
import {GetJudgesResponseData} from "../../shared/GetJudgesRequestTypes";
import {GlobalStatusResponseData} from "../../shared/GlobalStatusRequestTypes";
import {RatingAssignmentForm, RankingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";
import {segue} from "../util";
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
import {Application} from "../Application";

export class JudgeApp extends Application<JudgeAppState> {
  socket: Socket;

  judgeId: number;
  currentAssignment?: GetAssignmentResponseData;

  constructor(props: any) {
    super(props);

    this.state = {
      connectionStatus: ConnectionStatus.Weak,
      subPage: "JUDGE_SUBPAGE_LOADING"
    };

    this.socket = new Socket();
    this.socket.onConnectionEvent(evt => this.handleSocketConnectionEvent(evt));

    this.judgeId = getLoggedInJudgeId();

    this.initializePhase();
  }

  initializePhase() {
    this.socket.sendRequest({
      requestName: "REQUEST_GLOBAL_STATUS"
    }).then((res: GlobalStatusResponseData) => {
      if (res.phase === PHASE_SETUP) {
        this.setState({subPage: "JUDGE_SUBPAGE_SETUP"});
      } else if (res.phase === PHASE_COLLECTION) {
        this.initializeJudge();
      } else if (res.phase === PHASE_TALLY) {
        this.setState({subPage: "JUDGE_SUBPAGE_END"});
      } else {
        throw new Error(`Bad phase ${res.phase}`);
      }
    });
  }

  initializeJudge() {
    this.socket.sendRequest({
      requestName: "REQUEST_GET_JUDGES"
    }).then((res: GetJudgesResponseData) => {
      const myself = res.judges.find(judge => judge.id === this.judgeId);
      if (myself) {
        this.setState({judgeName: myself.name});
        this.loadAssignment();
      } else {
        this.setState({subPage: "JUDGE_SUBPAGE_BAD_CREDENTIALS"});
      }
    });
  }

  handleSocketConnectionEvent(evt: string) {
    if (evt === "connect") {
      this.setState({connectionStatus: ConnectionStatus.Good});
    } else if (evt === "disconnect") {
      this.setState({connectionStatus: ConnectionStatus.Weak});
    } else if (evt === "reconnect_failed") {
      this.setState({connectionStatus: ConnectionStatus.Disconnected});
    }
  }

  loadAssignment() {
    const start = new Date().getTime();

    this.socket.sendRequest({
      requestName: "REQUEST_GET_ASSIGNMENT",
      judgeId: this.judgeId
    }).then((res: GetAssignmentResponseData) => {
      this.currentAssignment = res;

      if (res.assignmentType === ASSIGNMENT_TYPE_RATING) {
        this.setState({
          subPage: "JUDGE_SUBPAGE_ASSIGNMENT_RATING",
          currentAssignmentId: res.id,
          ratingAssignment: res.ratingAssignment,
          startTime: start
        });
      } else if (res.assignmentType === ASSIGNMENT_TYPE_RANKING) {
        this.setState({
          subPage: "JUDGE_SUBPAGE_ASSIGNMENT_RANKING",
          currentAssignmentId: res.id,
          rankingAssignment: res.rankingAssignment,
          startTime: start
        });
      } else if (res.assignmentType === 0) {
        this.setState({
          subPage: "JUDGE_SUBPAGE_ASSIGNMENT_NONE",
          currentAssignmentId: 0
        });
      } else {
        console.log(res);
        throw new Error(`Unhandled assignment type ${res.assignmentType}`);
      }
    });
  }

  submitRatingAssignment(form: RatingAssignmentForm) {
    //Get current time
    const end = new Date().getTime();
    var elapsed = null;
    //Subtract the start time
    //Get start time using this.state.startTime
    if (this.state.startTime != null){
      elapsed = end - this.state.startTime;
      elapsed = elapsed/60000; //convert milliseconds to minutes
    }
    this.socket.sendRequest({
      requestName: "REQUEST_SUBMIT_ASSIGNMENT",
      assignmentId: this.currentAssignment!.id,
      ratingAssignmentForm: form,
      //submit the calculated time
      judgetimer: elapsed
    }).then(res => {
      this.loadAssignment();
    });
  }

  submitRankingAssignment(form: RankingAssignmentForm) {
    //Get current time
    const end = new Date().getTime();
    var elapsed = null;
    //Subtract the start time
    //Get start time using this.state.startTime
    if (this.state.startTime != null){
      elapsed = end - this.state.startTime;
      elapsed = elapsed/60000; //convert milliseconds to minutes
    }
    this.socket.sendRequest({
      requestName: "REQUEST_SUBMIT_ASSIGNMENT",
      assignmentId: this.currentAssignment!.id,
      rankingAssignmentForm: form,
      judgetimer: elapsed
    }).then(res => {
      this.loadAssignment();
    });
  }

  getPageProps(): JudgePageProps {
    const baseProps: JudgePageProps = {
      subPage: this.state.subPage,
      connectionStatus: this.state.connectionStatus,
      onSegue: segue
    };

    if (this.state.subPage === "JUDGE_SUBPAGE_ASSIGNMENT_RATING") {
      return {
        ...baseProps,

        judgeName: this.state.judgeName,
        assignmentId: this.state.currentAssignmentId,
        ratingAssignment: this.state.ratingAssignment,
        onSubmitRatingAssignment: f => this.submitRatingAssignment(f)
      };
    } else if (this.state.subPage === "JUDGE_SUBPAGE_ASSIGNMENT_RANKING") {
      return {
        ...baseProps,

        judgeName: this.state.judgeName,
        assignmentId: this.state.currentAssignmentId,
        rankingAssignment: this.state.rankingAssignment,
        onSubmitRankingAssignment: f =>this.submitRankingAssignment(f)
      };
    } else {
      return baseProps;
    }
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
  startTime?: number;

  currentAssignmentId?: number;
  ratingAssignment?: RatingAssignment;
  rankingAssignment?: RankingAssignment;
}
