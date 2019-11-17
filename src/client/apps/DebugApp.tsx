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
  templates: Map<string, string>;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();
    (window as any).socket = this.socket;

    this.state = {
      userEvent: "{}"
    };

    this.loadTemplates();

    this.templates = new Map([
      ["status", "{\"requestName\": \"REQUEST_GLOBAL_STATUS\"}"],
      ["beginJudging", "{\"requestName\": \"REQUEST_BEGIN_JUDGING\"}"]
    ]);
  }

  loadTemplates() {
    const xhr = new XMLHttpRequest();
    const outsideThis = this;
    xhr.addEventListener("load", function () {
      const templateData = JSON.parse(this.responseText);
      const keys = Object.keys(templateData);
      for (let key of keys) {
        if (!outsideThis.templates.has(key)) {
          outsideThis.templates.set(key, JSON.stringify(templateData[key]))
        }
      }
    });
    xhr.open("GET", "/templates.json");
    xhr.send();
  }

  setUserEvent(json: string) {
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

  loadTemplate(name: string) {
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
          >
            {`Global Status`}
          </Button>
          <Button
            onClick={() => this.loadTemplate("beginJudging")}
          >
            {`Begin Judging`}
          </Button>
          <Button
            onClick={() => this.loadTemplate("samplePopulate")}
          >
            {`Load Sample Populate Data`}
          </Button>
        </ButtonGroup>

        <h2>{`Response`}</h2>
        <Input type="textarea" readOnly value={this.state.response} />

      </Container>
    );
  }
}
