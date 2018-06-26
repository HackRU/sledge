import React from "react";

import {Button, ButtonGroup} from "reactstrap";

import {InterfaceMode} from "./state.js";
import {connect} from "./helpers.js";
import {prevHack, openList, nextHack} from "../judge/actions.js";

const pf = "toolbar";

export interface StateProps {
  prevButtonEnabled : boolean;
  listButtonEnabled : boolean;
  nextButtonEnabled : boolean;
}

export interface DispatchProps {
  onPrev: () => void;
  onList: () => void;
  onNext: () => void;
}

export type Props = StateProps & DispatchProps;

export const ToolbarPresentation = (p : Props) => (
  <div className={pf}>
    <div className={`${pf}-title`}>
      <h1>{"SLEDGE"}</h1>
    </div>
    <ButtonGroup className={`${pf}-buttons`}>
      <Button
        disabled={!p.prevButtonEnabled}
        onClick={p.onPrev}
        className={`${pf}-prev`}
      >{"\u2190"}</Button>
      <Button
        disabled={!p.listButtonEnabled}
        onClick={p.onList}
        className={`${pf}-list`}
      >{"LIST"}</Button>
      <Button
        disabled={!p.nextButtonEnabled}
        onClick={p.onNext}
        className={`${pf}-next`}
      >{"\u2192"}</Button>
    </ButtonGroup>
  </div>
)

export const Toolbar = connect<StateProps, DispatchProps, {}>(
  state => ({
    prevButtonEnabled: offsetTo(state.myHacks, -1, state.currentHackId) >= 0,
    listButtonEnabled: state.interfaceMode === InterfaceMode.Judging,
    nextButtonEnabled: offsetTo(state.myHacks, 1, state.currentHackId) >= 0
  }),
  dispatch => ({
    onPrev: () => prevHack(dispatch),
    onList: () => openList(dispatch),
    onNext: () => nextHack(dispatch)
  })
)(ToolbarPresentation);

function offsetTo(nums : number[], offset: number, x : number) : number {
  let idx = nums.indexOf(x);
  let idxOffset = idx + offset;
  return (
    idx >= 0 &&
    idxOffset >= 0 && idxOffset < nums.length
  ) ? idxOffset : -1;
}
