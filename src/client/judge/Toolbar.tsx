import React from "react";

import {Button, ButtonGroup} from "reactstrap";

import {InterfaceMode} from "./types";
import {connect} from "./connect";
import {openList, openHack} from "./actions";

const pf = "toolbar";

export interface Props {
  prevButtonEnabled: boolean;
  listButtonEnabled: boolean;
  nextButtonEnabled: boolean;

  onPrev: () => void;
  onList: () => void;
  onNext: () => void;
}

export const ToolbarPresentation = (p : Props) => (
  <div className={pf}>
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

export const Toolbar = connect<{}, Props>(
  (ownProps, state, dispatch) => ({
    prevButtonEnabled: offsetTo(state.myHacks, -1, state.currentHackId) >= 0,
    listButtonEnabled: state.interfaceMode === InterfaceMode.Judging,
    nextButtonEnabled: offsetTo(state.myHacks, 1, state.currentHackId) >= 0,

    onPrev: () => dispatch(openHack(prev(state.myHacks, state.currentHackId))),
    onList: () => dispatch(openList()),
    onNext: () => dispatch(openHack(next(state.myHacks, state.currentHackId)))
  })
)(ToolbarPresentation);

function prev(hackIds: number[], currentHackId: number) {
  let idx = offsetTo(hackIds, -1, currentHackId);
  if (idx < 0) {
    return currentHackId;
  } else {
    return hackIds[idx];
  }
}

function next(hackIds: number[], currentHackId: number) {
  let idx = offsetTo(hackIds, 1, currentHackId);
  if (idx < 0) {
    return currentHackId;
  } else {
    return hackIds[idx];
  }
}

function offsetTo(nums : number[], offset: number, x : number) : number {
  let idx = nums.indexOf(x);
  let idxOffset = idx + offset;
  return (
    idx >= 0 &&
    idxOffset >= 0 && idxOffset < nums.length
  ) ? idxOffset : -1;
}
