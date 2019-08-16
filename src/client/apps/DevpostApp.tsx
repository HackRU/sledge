import React from "react";

import {
  Container,
  Input,
  Button
} from "reactstrap";

import {TextSubmit} from "../components/TextSubmit";
import {Socket} from "../Socket";
import {parseDevpostData, TEST_CSV_URL} from "../Devpost";

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

  private onChanged(csv) {
    let parsed = parseDevpostData(csv);
    let json = JSON.stringify(parsed);

    if (!parsed.error) {

      localStorage["setup"] = JSON.stringify(convertDevpostToSetupData(parsed));

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

  private loadTestData() {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      let parsed = parseDevpostData(xhr.responseText);
      let json = JSON.stringify(parsed);

      if (!parsed.error) {
        localStorage["setup"] = JSON.stringify(convertDevpostToSetupData(parsed));
        this.setState({
          result: json,
          status: `Successfully loaded from ${TEST_CSV_URL}`
        });
      } else {
        this.setState({
          result: json,
          status: "Unable to load test data: parse error"
        });
      }
    });
    xhr.addEventListener("error", () => {
      this.setState({
        status: "Unable to load test data: xhr error"
      });
    });
    xhr.open("GET", TEST_CSV_URL);
    xhr.send();
  }

  render() {
    return (
      <Container id="DevpostApp">
        <h1>{`Load Submission Data from Devpost`}</h1>

        <Button
          onClick={() => this.loadTestData()}
        >{`Load Test Data (HackRU sp2019)`}</Button>

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

function convertDevpostToSetupData(devpostData) {
  return {
    prizes: devpostData.prizes,
    submissions: devpostData.submissions.map(d => ({
      name: d.name,
      location: d.table,
      prizes: d.prizes
    }))
  };
}
