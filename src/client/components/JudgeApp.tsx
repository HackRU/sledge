import React from "react";

import {Container} from "reactstrap";

import {JudgeState, InterfaceMode} from "../judge/state.js";
import {connect} from "../judge/helpers.js";
import {Toolbar} from "./Toolbar.js";

export interface StateProps {
  interfaceMode : InterfaceMode;
}

export type Props = StateProps;

export const JudgeAppPresentation = (props : Props) => {
  switch (props.interfaceMode) {
    case InterfaceMode.Judging:
      return (<JudgingPresentation {...props} />);
    case InterfaceMode.Listing:
      return (<ListingPresentation {...props} />);
    case InterfaceMode.Modal:
      return (<ModalPresentation {...props} />);
  }
  throw new Error("Unhandled enum");
}

const pf = "judgeapp";

export const JudgingPresentation = (props:Props) => (
  <Container className={pf}>
    <Toolbar />
    <p>{"Judging"}</p>
  </Container>
)

export const ListingPresentation = (props:Props) => (
  <Container className={pf}>
    <Toolbar />
    <p>{"Listing"}</p>
  </Container>
)

export const ModalPresentation = (props:Props) => (
  <Container className={pf}>
    <Toolbar />
    <p>{"Modal"}</p>
  </Container>
)

export const JudgeApp = connect<StateProps, {}, {}>(
  (state:StateProps) => ({
    interfaceMode: state.interfaceMode
  })
)(JudgeAppPresentation)
