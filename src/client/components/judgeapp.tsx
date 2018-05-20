import * as React from "react";

import {JudgeStore, JudgeAction} from "lib/client/reducers/judgeapp.js";

export class JudgeApp extends React.Component<Props, {}> {
  constructor(props : Props) {
    super(props);
  }

  render() {
    return (
      <span>{"TODO"}</span>
    );
  }
}

export interface Props extends JudgeStore {
  dispatch : (a:JudgeAction) => void;
}
