import React from "react";

import {
  Container,
  Input,
  ButtonGroup,
  Button
} from "reactstrap";

import {Socket} from "./Socket";

export class LoginApp extends React.Component<any,any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Container id="LoginApp">
      </Container>
    );
  }
}
