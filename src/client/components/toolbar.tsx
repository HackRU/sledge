import React from "react";
import {Button, ButtonGroup} from "reactstrap";

import {Props} from "./judgeapp";

export class Toolbar extends React.Component<Props, {}> {
  constructor(props : Props) {
    super(props);
  }

  render() {
    return presentation({
      prevButtonEnabled: true,
      listButtonEnabled: true,
      nextButtonEnabled: true,

      onPrev: () => {},
      onList: () => {},
      onNext: () => {}
    });
  }
}

export function presentation(p : PresentationProps) {
  let pf = "toolbar";

  return (
    <div className={`${pf}-comp`}>
      <div className={`${pf}-title`}>
        <h1>{"SLEDGE"}</h1>
      </div>
      <ButtonGroup className={`${pf}-buttons`}>
        <Button disabled={!p.prevButtonEnabled} onClick={p.onPrev}>{"\u2190"}</Button>
        <Button disabled={!p.listButtonEnabled} onClick={p.onList}>{"LIST"}</Button>
        <Button disabled={!p.nextButtonEnabled} onClick={p.onNext}>{"\u2192"}</Button>
      </ButtonGroup>
    </div>
  );
}

export interface PresentationProps {
  prevButtonEnabled : boolean;
  listButtonEnabled : boolean;
  nextButtonEnabled : boolean;
  onPrev : () => void;
  onList : () => void;
  onNext : () => void;
}
