import React from "react";

import {Alert, Container} from "reactstrap";
import {Store} from "redux";

import {State, Action, InterfaceMode} from "./types.js";
import {fail} from "./actions.js";
import {connect} from "./connect.js";
import {Toolbar} from "./Toolbar.js";
import {JudgeInfo} from "./JudgeInfo.js";
import {Header} from "./Header.js";
import {HacksList} from "./HacksList.js";

export const JudgeAppPresentation = (props : State) => {
  switch (props.interfaceMode) {
    case InterfaceMode.Loading:
      return (<LoadingPresentation {...props} />);
    case InterfaceMode.Judging:
      return (<JudgingPresentation {...props} />);
    case InterfaceMode.Listing:
      return (<ListingPresentation {...props} />);
    case InterfaceMode.Fail:
      return (<FailPresentation {...props} />);
  }
  throw new Error("Unhandled enum");
}

const pf = "judgeapp";

export const LoadingPresentation = (props: State) => (
  <Container className={pf}>
    <Header />
    <ul>
      {props.loadingMessages.map((message,i) => (
        <li key={i}><pre>{message}</pre></li>
      ))}
    </ul>
  </Container>
)

export const JudgingPresentation = (props: State) => (
  <Container className={pf}>
    <Header />
    <Toolbar />
    <p>{"Judging"}</p>
  </Container>
)

export const ListingPresentation = (props: State) => (
  <Container className={pf}>
    <Header />
    <JudgeInfo />
    <HacksList />
  </Container>
)

export const FailPresentation = (props: State) => (
  <Container className={pf}>
    <Header />
    <Alert color="danger" transition={{ baseClass: '', timeout: 0 }}>
      {`A critical error has caused Sledge to stop. See below for details.`}
    </Alert>
    <pre>{props.failMessage}</pre>
  </Container>
);

export const JudgeAppConnected = connect<{}, State>(
  (ownProps, state, dispatch) => state
)(JudgeAppPresentation)

export class JudgeApp extends React.Component<{store: Store<State, Action>}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidCatch(error: Error, info: any) {
    this.setState({hasError: true});
    this.props.store.dispatch(fail(`Error in UI handling: ${error.message}`));
  }

  render() {
    return (<JudgeAppConnected />);
  }
}
