import React from "react";

import {
  Container,
  Input,
  ButtonGroup,
  Button
} from "reactstrap";

import {catchOnly} from "../../shared/util";

import {Socket} from "../Socket";

export class DebugApp extends React.Component<any,any> {
  socket: Socket;
  templates;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();
    (window as any).socket = this.socket;

    this.state = {
      userEvent: "{}"
    };

    this.templates = new Map([
      ["status", "{\"requestName\": \"REQUEST_GLOBAL_STATUS\"}"]
    ]);
  }

  setUserEvent(json) {
    this.setState({ userEvent: json });
  }

  sendRequest() {
    let obj = catchOnly("SyntaxError", () => JSON.parse(this.state.userEvent));
    if (obj instanceof Error) {
      this.setState({ response: obj.message });
      return;
    }
    this.socket.sendDebug(obj).then(res => {
      let json = JSON.stringify(res);
      this.setState({ response: json });
    });
  }

  loadTemplate(name) {
    this.setState({ userEvent: this.templates.get(name) });
  }

  render() {
    return (
      <Container id="DebugApp">
        <h1>{`Debug`}</h1>

        <p>{`This page is to assist with client-side debugging.`}</p>

        <h2>{`Send Events`}</h2>
        <Input
          type="textarea"
          value={this.state.userEvent}
          onChange={evt => this.setUserEvent(evt.target.value)}
        />
        <div>
          <Button
            onClick={() => this.sendRequest()}
          >{`Send`}</Button>
        </div>
        <span>{`Templates:`}</span>
        <ButtonGroup>
          <Button
            onClick={() => this.loadTemplate("status")}
          >{`Global Status`}</Button>
        </ButtonGroup>

        <h2>{`Response`}</h2>
        <Input type="textarea" readOnly value={this.state.response} />

      </Container>
    );
  }
}
