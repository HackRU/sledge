import React from "react";

import {Container} from "reactstrap";

import {State, InterfaceMode} from "./types.js";
import {connect} from "./connect.js";
import {Toolbar} from "./Toolbar.js";
import {JudgeInfo} from "./JudgeInfo.js";

export interface StateProps {
  interfaceMode : InterfaceMode;
}

export type Props = StateProps;

export const JudgeAppPresentation = (props : Props) => {
  switch (props.interfaceMode) {
    case InterfaceMode.Loading:
      return (<LoadingPresentation {...props} />);
    case InterfaceMode.Judging:
      return (<JudgingPresentation {...props} />);
    case InterfaceMode.Listing:
      return (<ListingPresentation {...props} />);
  }
  throw new Error("Unhandled enum");
}

const pf = "judgeapp";

export const LoadingPresentation = (props: Props) => (
  <Container className={pf}>
    <span>{`Loading...`}</span>
  </Container>
)

export const JudgingPresentation = (props:Props) => (
  <Container className={pf}>
    <Toolbar />
    <p>{"Judging"}</p>
  </Container>
)

export const ListingPresentation = (props:Props) => (
  <Container className={pf}>
    <Toolbar />
    <JudgeInfo />
  </Container>
)

export const JudgeApp = connect<{}, Props>(
  (ownProps, state, dispatch) => ({
    interfaceMode: state.interfaceMode
  })
)(JudgeAppPresentation)
