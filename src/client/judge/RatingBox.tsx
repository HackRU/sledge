import React from "react";
import {Button, ButtonGroup} from "reactstrap";

import {Hack, Row} from "../../protocol/database";

import {InterfaceMode} from "./types";
import {connect} from "./connect";
import {rateHack} from "./actions";

const pf = "ratingbox";

export interface Props {
  hack: Row<Hack>;
  categories: Array<Cat>;
  onChoose: (categoryId: number, rating: number) => void;
}

interface Cat {
  id: number;
  name: string;
  rating: number;
}

export const RatingBoxPresentation = (p: Props) => {
  return (
    <div className={pf}>
      <h2>{`Overall Rating`}</h2>
      <div className="ratingbox-category">
        {p.categories.map(c => (
          <RatingBoxCategory key={c.id} {...c} onChoose={p.onChoose} />
        ))}
      </div>
    </div>
  );
};

interface RatingBoxCategoryProps {
  id: number;
  name: string;
  rating: number;
  onChoose: (categoryId: number, rating: number) => void;
}

const RatingBoxCategory = (p: RatingBoxCategoryProps) => (
  <div className="ratingbox-category">
    <div className="ratingbox-catname">
      <h3>{p.name}</h3>
    </div>
    <ButtonGroup>
      {range(1,5).map(r => (
        <Button
          key={r}
          className={p.rating === r ? "ratingbox-selected" : ""}
          onClick={() => p.onChoose(p.id, r)}
        >{r.toString(10)}</Button>
      ))}
    </ButtonGroup>
  </div>
);

export const RatingBox = connect<{}, Props>(
  (ownProps, state, dispatch) => ({
    hack: state.hacks[state.currentHackId],
    categories: state.categories.filter(c => !!c).map(c => ({
      id: c.id,
      name: c.name,
      rating: state.ratings[state.currentHackId-1][c.id-1]
    })),
    onChoose: (categoryId, rating) => {
      let newRatings = state.ratings[state.currentHackId-1].slice();
      newRatings[categoryId-1] = rating;
      dispatch(rateHack(state.myJudgeId, state.currentHackId, newRatings));
    }
  })
)(RatingBoxPresentation);

function range(start: number, end: number) {
  let arr = [];
  for (let i=start;i<=end;i++) {
    arr.push(i);
  }
  return arr;
}
