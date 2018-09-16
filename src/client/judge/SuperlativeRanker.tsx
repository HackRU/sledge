import React from "react";
import {Button, ButtonGroup} from "reactstrap";

import {
  Superlative,
  SuperlativeHack,
  SuperlativePlacement,
  Row
} from "../../protocol/database";

import {State} from "./types";
import {connect} from "./connect";
import {
  setSuperlativeRanking
} from "./actions";

const pf = "srank";

export interface Props {
  superlatives: Array<SuperlativeGadgetProps>;
}

export const SuperlativeRankerPresentation = (p: Props) => {
  return (
    <div className={pf}>
      <h2>{`Superlatives`}</h2>
      {p.superlatives.length > 0 ?
        p.superlatives.map((s,i) => (
          <SuperlativeGadget key={i} {...s} />
        )) : (
          <div>
            <span>{`This hack is not eligable for any Superlatives.`}</span>
          </div>
      )}
    </div>
  );
};

export const SuperlativeRanker = connect<{}, Props>(
  (ownProps, state, dispatch) => {
    let supersForHack = findSuperlativesForHack(state, state.currentHackId);

    return {
      superlatives: findSuperlativesForHack(state, state.currentHackId).map(s => {
        let firstChoiceId = state.mySuperPlacements[s.id].firstChoiceId;
        let secondChoiceId = state.mySuperPlacements[s.id].secondChoiceId;

        return {
          name: s.name,
          firstChoiceName: firstChoiceId ? state.hacks[firstChoiceId].name : "[NONE SELECTED]",
          secondChoiceName: secondChoiceId ? state.hacks[secondChoiceId].name : "[NONE SELECTED]",

          onSetFirst: () => {
            dispatch(setSuperlativeRanking(state.myJudgeId, s.id, state.currentHackId, 0))
          },
          onSetSecond: () => { /* TODO */ },
          onClearFirst: () => { /* TODO */ },
          onClearSecond: () => { /* TODO */ },
          onUndo: () => { /* TODO */ }
        }
      }),

    }
  }
)(SuperlativeRankerPresentation);

function findSuperlativesForHack(props: State, hackId: number): Array<Row<Superlative>> {
  let relevantSupers: Array<SuperlativeHack> = [];
  for (let s of props.superlativeHacks) {
    if (s && s.hackId === hackId) {
      relevantSupers.push(s);
    }
  }

  return relevantSupers.map(sh => props.superlatives[sh.superlativeId]);
}

export const SuperlativeGadget = (p: SuperlativeGadgetProps) => (
  <div className="supgadget">
    <div className="supgadget-name">
      <h3>{p.name}</h3>
    </div>

    <div className="supgadget-set">
      <button
        className="supgadget-button-first"
        onClick={p.onSetFirst}
      >{`FIRST`}</button>
      <button
        className="supgadget-button-second"
        onClick={p.onSetSecond}
      >{`SECOND`}</button>
    </div>
    <div className="supgadget-clear">
      <button
        className="supgadget-button-clear1"
        onClick={p.onClearFirst}
      >{`CLEAR 1`}</button>
      <button
        className="supgadget-button-clear2"
        onClick={p.onClearSecond}
      >{`CLEAR 2`}</button>
      <button
        className="supgadget-button-undo"
        onClick={p.onUndo}
      >{`UNDO`}</button>
    </div>

    <div className="supgadget-one">
      <div className="supgadget-place">
        <h4>{`1`}</h4>
      </div>
      <div className="supgadget-hack">
        <span>{p.firstChoiceName}</span>
      </div>
    </div>

    <div className="supgadget-two">
      <div className="supgadget-place">
        <h4>{`2`}</h4>
      </div>
      <div className="supgadget-hack">
        <span>{p.secondChoiceName}</span>
      </div>
    </div>

  </div>
);

export interface SuperlativeGadgetProps {
  name: string;
  firstChoiceName: string;
  secondChoiceName: string;

  onSetFirst: () => void;
  onSetSecond: () => void;
  onClearFirst: () => void;
  onClearSecond: () => void;
  onUndo: () => void;
}
