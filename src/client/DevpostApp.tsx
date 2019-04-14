import React from "react";

import {
  Container,
  Input
} from "reactstrap";

import {TextSubmit} from "./TextSubmit";
import {Socket} from "./Socket";
import {parseDevpostData} from "./Devpost";

export class DevpostApp extends React.Component<any,any> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();

    this.state = {
      result: "",
      status: "nothing to report"
    };
  }

  onChanged(csv) {
    let parsed = parseDevpostData(csv);
    let json = JSON.stringify(parsed);

    if (!parsed.error) {

      localStorage["setup"] = json;

      this.setState({
        result: json,
        status: "Parsed devpost data and saved to localstorage"
      });
    } else {
      this.setState({
        result: json,
        status: "Unable to successfully parse data"
      });
    }
  }

  render() {
    return (
      <Container id="DevpostApp">
        <h1>{`Use Submission Data from Devpost`}</h1>

        <TextSubmit onChange={csv => this.onChanged(csv)} />

        <Input
          type="textarea"
          readOnly
          value={this.state.result}
        />

        <p>{`Status: `}{this.state.status}</p>

      </Container>
    );
  }
}
