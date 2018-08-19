import React from "react";
import {Button, ButtonGroup} from "reactstrap";

import {
  Superlative,
  SuperlativeHack,
  Row
} from "../../protocol/database";

import {State} from "./types";
import {connect} from "./connect";

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
  (ownProps, state, dispatch) => ({
    superlatives: findSuperlativesForHack(state, state.currentHackId).map(s => ({
      name: s.name,
      firstChoiceName: "[None]",
      secondChoiceName: "[None]"
    }))
  })
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
      >{`FIRST`}</button>
      <button
        className="supgadget-button-second"
      >{`SECOND`}</button>
    </div>
    <div className="supgadget-clear">
      <button
        className="supgadget-button-clear1"
      >{`CLEAR 1`}</button>
      <button
        className="supgadget-button-clear2"
      >{`CLEAR 2`}</button>
      <button
        className="supgadget-button-undo"
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
}
