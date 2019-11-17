import React from "react";

import {
  ControlPanelPage,
  ControlPanelPageProps,
  AssignPrizeToJudgeForm
} from "../components/ControlPanelPage";
import {
  GetFullScoresResponseData,
  getPlaceholderFullScoresResponseData
} from "../../shared/GetFullScoresRequestTypes";

import {Socket} from "../Socket";

export class ControlPanelApp extends React.Component<any, ControlPanelAppState> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();

    this.state = {
      fullScores: getPlaceholderFullScoresResponseData(),

      assignPrizeToJudgeForm: {
        judgeIndex: -1,
        prizeIndex: -1
      }
    };

    this.socket.sendRequest({
      requestName: "REQUEST_GET_FULL_SCORES"
    }).then((res: GetFullScoresResponseData) => {
      this.setState({
        fullScores: res
      });
    });
  }

  getPageProps(): ControlPanelPageProps {
    return {
      judges: this.state.fullScores.judges.map(j => `${j.name} (ID: ${j.id})`),
      prizes: this.state.fullScores.prizes.map(p => `${p.name} (ID: ${p.id})`),

      assignPrizeToJudgeForm: this.state.assignPrizeToJudgeForm,
      onAlterAssignPrizeToJudgeForm: f => this.setState(oldState => ({
        assignPrizeToJudgeForm: f(oldState.assignPrizeToJudgeForm)
      })),
      onSubmitAssignPrizeToJudgeForm: () => {
        this.socket.sendRequest({
          requestName: "REQUEST_ASSIGN_PRIZE_TO_JUDGE",
          judgeId: this.state.fullScores.judges[this.state.assignPrizeToJudgeForm.judgeIndex].id,
          prizeId: this.state.fullScores.prizes[this.state.assignPrizeToJudgeForm.prizeIndex].id
        });
        this.setState({assignPrizeToJudgeForm: {judgeIndex: -1, prizeIndex: -1}});
      }
    };
  }

  render() {
    return React.createElement(
      ControlPanelPage,
      this.getPageProps()
    );
  }
}

interface ControlPanelAppState {
  fullScores: GetFullScoresResponseData;
  assignPrizeToJudgeForm: AssignPrizeToJudgeForm;
}
