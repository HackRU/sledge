import React from "react";

import {
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from "reactstrap";

import {Row, Hack} from "../../protocol/database.js";

import {InterfaceMode} from "./types.js";
import {connect} from "./connect.js";
import {openHack} from "./actions.js";

const pf = "hacklist";

export interface Props {
  hacks: Array<Row<Hack> & {totalRating: number}>;
  currentHackId: number;

  openHack: (id: number) => void;
}

export const HacksListPresentation = (p : Props) => (
  <div className={pf}>
    <ListGroup>
      <ListGroupItem color="info">
        <ListGroupItemHeading>{`Welcome to Sledge!`}</ListGroupItemHeading>
        <ListGroupItemText>
          {`Below are the hacks you will be judging. White indicates you have not given that hack `}
          {`an overall rating. The hacks are ordered in the recommended judging order (so `}
          {`you are spread out relative to other judges), but you can go out of order if necessary.`}
        </ListGroupItemText>
      </ListGroupItem>
      {p.hacks.map(h => (
        <ListGroupItem
          key={h.id}
          tag="button"
          active={h.id===p.currentHackId}
          onClick={() => p.openHack(h.id)}
        >{hackText(h)}</ListGroupItem>
      ))}
    </ListGroup>
  </div>
)

function hackText(h: Row<Hack> & {totalRating: number}) {
  if (h.totalRating > 0) {
    return `${h.name} (${h.totalRating})`;
  } else {
    return h.name;
  }
}

export const HacksList = connect<{}, Props>(
  (ownProps, state, dispatch) => ({
    hacks: state.myHacks.map(hackId => ({
      ...state.hacks[hackId],
      totalRating: state.ratings[hackId-1].reduce((a,b) => a+b, 0)
    })),
    currentHackId: state.currentHackId,

    openHack: id => dispatch(openHack(id))
  })
)(HacksListPresentation);
