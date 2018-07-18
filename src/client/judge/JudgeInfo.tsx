import React from "react";

import {InterfaceMode} from "./types.js";
import {connect} from "./connect.js";

const pf = "judgeinfo";

export interface Props {
  judgeName: String;
  judgeId: number;
}

export const JudgeInfoPresentation = (p: Props) => {
  return (
    <div className={pf}>
      <span>
        {`You are logged in as `}<b>{p.judgeName}</b>{` (ID: ${p.judgeId}).`}
      </span>
    </div>
  );
};

export const JudgeInfo = connect<{}, Props>(
  (ownProps, state, dispatch) => ({
    judgeName: state.myJudgeId ?
      state.judges[state.myJudgeId].name :
      "unknown",
    judgeId: state.myJudgeId
  })
)(JudgeInfoPresentation);
