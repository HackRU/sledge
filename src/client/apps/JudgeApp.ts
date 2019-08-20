import React from "react";
import {Socket} from "../Socket";

import {ClientStorage} from "../ClientStorage";
import {JudgePage, JudgePageProps} from "../components/JudgePage";
import {ConnectionStatus} from "../JudgeTypes";
import {GetJudgesResponseData} from "../../shared/GetJudgesRequestTypes";
import {GlobalStatusResponseData} from "../../shared/GlobalStatusRequestTypes";
import {
  GetAssignmentResponseData,
  RatingAssignment
} from "../../shared/GetAssignmentRequestTypes";
import {
  PHASE_SETUP,
  PHASE_COLLECTION,
  PHASE_TALLY,
  ASSIGNMENT_TYPE_RATING
} from "../../shared/constants";

export class JudgeApp extends React.Component<any, JudgeAppState> {
  socket: Socket;
  clientStorage: ClientStorage;

  judgeId: number;

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
        this.setState({
          subPage: "JUDGE_SUBPAGE_ASSIGNMENT_RATING",
          ratingAssignment: res.ratingAssignment
        });
      } else {
        throw new Error(`Unhandled assignment type ${res.assignmentType}`);
      }
    });
  }

  getPageProps(): JudgePageProps {
    return {
      connectionStatus: this.state.connectionStatus,
      subPage: this.state.subPage,
      ratingAssignment: this.state.ratingAssignment,

      onSegue: to => {window.location.hash = to;}
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
}
