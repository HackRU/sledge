import React from "react";
import {Container} from "reactstrap";

import {Mode} from "lib/client/reducers/judgeapp";
import {JudgeStore, JudgeAction} from "lib/client/reducers/judgeapp";

import {Toolbar} from "./toolbar";

export class JudgeApp extends React.Component<Props, {}> {
  constructor(props : Props) {
    super(props);
  }

  renderJudging() {
    return <div/>;
  }

  renderListHacks() {
    return (
      <Container>
        <Toolbar {...this.props} />
      </Container>
    );
  }

  render() {
    return this.renderListHacks();
/*
    if (this.props.mode === Mode.Connecting) {
      return (<span>{"Connecting..."}</span>);
    } else if (this.props.mode === Mode.WaitingForHacks) {
      return (<span>{"Waiting for Hacks..."}</span>);
    } else if (this.props.mode === Mode.Judging) {
      return this.renderJudging();
    } else if (this.props.mode === Mode.ListHacks) {
      return this.renderListHacks();
    } else if (this.props.mode == Mode.Failure) {
      return (<span>{"Sledge has stopped due to an unrecoverable failure."}</span>);
    } else {
      return (<span>{"Unknown Mode: " + this.props.mode}</span>);
    }*/
  }
}

export interface Props extends JudgeStore {
  dispatch : (a:JudgeAction) => void;
}
