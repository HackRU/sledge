import React from "react";

import {
  Container,
  Input,
  InputGroup,
  InputGroupAddon
} from "reactstrap";

export const ControlPanelPage = props => (
  <Container id="ControlPanelPage">
    <h1>{`Admin Control Panel`}</h1>

    <h2>{`Assign Prize to Judge`}</h2>

    <InputGroup>
      <InputGroupAddon addonType="prepend">
        {`Judge`}
      </InputGroupAddon>
    </InputGroup>
  </Container>
);
