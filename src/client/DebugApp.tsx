import React from "react";

import {
  Container,
  Input
} from "reactstrap";

import {Socket} from "./Socket";

export class DebugApp extends React.Component {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();
    (window as any).socket = this.socket;
  }

  render() {
    return (
      <Container id="DebugApp">
        <h1>{`Debug`}</h1>

        <p>{`This page is to assist with client-side debugging.`}</p>

        <h2>{`Send Events`}</h2>
        <Input type="textarea" />
      </Container>
    );
  }
}
