import React from "react";

import {
  Alert,
  Card,
  CardTitle,
  CardText
} from "reactstrap";

import {Row, Hack} from "../../protocol/database";

import {InterfaceMode} from "./types";
import {connect} from "./connect";
import {openHack} from "./actions";

const pf = "hackinfo";

export interface Props {
  hack: Row<Hack>;
  notMineWarning: boolean;
}

export const HackInfoPresentation = (p : Props) => (
  <div className={pf}>
    { p.notMineWarning ?
      (<Alert color="warning">
        {`WARNING: You have somehow managed to open this hack despite us detecting `}
        {`that you were not assigned this hack. This probably means your hack `}
        {`assignments have changed. Click LIST to see your assigned hacks.`}
      </Alert>) : [] }
    <Card body>
      <CardTitle>{`Table ${p.hack.location}: ${p.hack.name}`}</CardTitle>
      <CardText>
        {p.hack.description.length > 203 ?
          p.hack.description.substr(0, 200) + "..." :
          p.hack.description }
      </CardText>
    </Card>
  </div>
)

export const HackInfo = connect<{}, Props>(
  (ownProps, state, dispatch) => ({
    hack: state.hacks[state.currentHackId],
    notMineWarning: state.myHacks.indexOf(state.currentHackId) < 0
  })
)(HackInfoPresentation);
