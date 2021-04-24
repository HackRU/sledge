import React from "react";

import {Card} from "reactstrap";

export const CardSection = (props: CardSectionProps) => (
  <Card style={{margin: "15px 0px", padding: "10px"}}>
    {props.children}
  </Card>
);

export interface CardSectionProps {
  children: JSX.Element;
}
