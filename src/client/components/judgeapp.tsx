import React from "react";

import {Mode} from "lib/client/reducers/judgeapp";

import {JudgeStore, JudgeAction} from "lib/client/reducers/judgeapp";

export class JudgeApp extends React.Component<Props, {}> {
  constructor(props : Props) {
    super(props);
  }

  render() {
    let message : string = this.props.mode;
    if (this.props.sledgeData) {
      message += " " + this.props.sledgeData.connectionStatus;
    }
    return (
      <span>{message}</span>
    );
  }
}

export interface Props extends JudgeStore {
  dispatch : (a:JudgeAction) => void;
}
