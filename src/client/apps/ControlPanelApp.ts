import React from "react";

import {ControlPanelPage} from "../components/ControlPanelPage";

export class ControlPanelApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  getPageProps() {
    return {
      judges: [],
      prizes: [],
      assignPrizeToJudgeForm: {
        judgeIndex: -1,
        prizeIndex: -1
      },

      onAlterAssignPrizeToJudgeForm: f => alert()
    };
  }

  render() {
    return React.createElement(
      ControlPanelPage,
      this.getPageProps()
    );
  }
}
