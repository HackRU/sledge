import React from "react";

import {Alert} from "reactstrap";

import {InterfaceMode} from "./types.js";
import {connect} from "./connect.js";

const pf = "judgeinfo";

export interface Props {
  judgeName: String;
  judgeId: number;
}

export const JudgeInfoPresentation = (p: Props) => {
  if (p.judgeId) {
    return (
      <div className={pf}>
        <Alert color="light">
          {`You are logged in as `}<b>{p.judgeName}</b>{` (ID: ${p.judgeId}).`}
        </Alert>
      </div>
    );
  } else {
    return (
      <div className={pf}>
        <Alert color="warning">
          {`You are not logged in.`}
        </Alert>
      </div>
    );
  }
};

export const JudgeInfo = connect<{}, Props>(
  (ownProps, state, dispatch) => ({
    judgeName: state.myJudgeId ?
      state.judges[state.myJudgeId].name :
      "unknown",
    judgeId: state.myJudgeId
  })
)(JudgeInfoPresentation);
