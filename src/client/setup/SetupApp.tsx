import React from "react";

import {
  Container,
  Form,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  ButtonGroup
} from "reactstrap";
import {List} from "immutable";

import {AddRow} from "./AddRow.js";

import {getSession, setSession} from "../session.js";
import {SledgeClient} from "../sledge.js";
import {importDevpostData} from "./devpost.js";

let sledge : SledgeClient;


function logPromise(p : Promise<any>) {
    p.then(r => console.log(r));
}

export class SetupApp extends React.Component<any, any> {
  constructor(props:any) {
    super(props)

    let session = getSession();

    this.state = {
      secret: session.secret
    };
  }

  setAuth() {
    setSession({
      secret: this.state.secret
    });
  }

  sendAuth() {
    if (sledge) {
      console.warn("Sledge already started. Refresh if you want to use an updated secret.");
      return;
    }

    sledge = new SledgeClient({
      host: document.location.host
    });
    sledge.subscribeSynchronize(function (evt) {
      console.log(evt);
    });
    logPromise(sledge.sendAuthenticate({
      secret: this.state.secret
    }));
  }

  render() {
    return (
      <Container>
        <h1>{`Setup`}</h1>

        {`Remember to look at the dev console for errors.`}

        <h2>{`Admin Authentication`}</h2>
        <Form>
          <Label>
            {`Secret: `}
            <Input
              value={this.state.secret}
              onChange={evt => this.setState({secret: evt.target.value})}
            />
          </Label>
          <ButtonGroup vertical>
            <Button onClick={() => this.setAuth()}>
              {`Set Secret`}
            </Button>
            <Button onClick={() => this.sendAuth()}>
              {`Authenticate`}
            </Button>
          </ButtonGroup>
        </Form>

        <h2>{`Synchronization`}</h2>
        <p>{`Synchronizations will show up in the console.`}</p>
        <ButtonGroup>
          <Button onClick={() => logPromise(sledge.sendSetSynchronize({
            sync: true
          }))}>
            {`Sync On`}
          </Button>
          <Button onClick={() => logPromise(sledge.sendSetSynchronize({
            sync: false
          }))}>
            {`Sync Off`}
          </Button>
        </ButtonGroup>

        <h2>{`Manually Add Data`}</h2>
        <AddRow
          name={"Add Judge"}
          fields={List.of("Name", "Email")}
          onAdd={f => logPromise(sledge.sendAddJudge({
            judge: {
              name: f.get(0),
              email: f.get(1),
              active: 1
            }
          }))}
        />
        <AddRow
          name={"Add Hack"}
          fields={List.of("Name", "Description", "Location (number)")}
          onAdd={f => logPromise(sledge.sendAddHack({
            hack: {
              name: f.get(0),
              description: f.get(1),
              location: parseInt(f.get(2)),
              active: 1
            }
          }))}
        />
        <AddRow
          name={"Add Category"}
          fields={List.of("Name")}
          onAdd={f => logPromise(sledge.sendAddCategory({
            category: {
              name: f.get(0)
            }
          }))}
        />
        <AddRow
          name={"Add Superlative"}
          fields={List.of("Name")}
          onAdd={f => logPromise(sledge.sendAddSuperlative({
            superlative: {
              name: f.get(0)
            }
          }))}
        />

        <h2>{`Import from Devpost`}</h2>
        <Form>
          <p>
            {`In your hackathon's dashboard select `}<em>{`Manage Hackathon`}</em>
            {` then `}<em>{`Metrics`}</em>{`. Under the section to export data `}
            {`generate a submission report. Copy and paste the generated CSV into`}
            {` the textarea and click `}<em>{`GO`}</em>{`.`}
          </p>
          <InputGroup>
            <Input
              type="textarea"
              onChange={evt => {
                let newVal = evt.target.value;
                this.setState({
                  devpostCSV: newVal
                })
              }}
              value={this.state.devpostCSV}
            />
            <InputGroupAddon addonType="append">
              <Button
                onClick={() => importDevpostData(sledge, this.state.devpostCSV)}
              >{`GO`}</Button>
            </InputGroupAddon>
          </InputGroup>
        </Form>
      </Container>
    );
  }
}
