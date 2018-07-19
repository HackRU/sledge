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
import {TabularActions} from "./TabularActions.js";
import {ToggleMatrix} from "./ToggleMatrix.js";

import {Table} from "../../protocol/database.js";
import {SynchronizeShared} from "../../protocol/events.js";

import {getSession, setSession} from "../session.js";
import {SledgeClient, SledgeStatus} from "../sledge.js";
import {importDevpostData} from "./devpost.js";
import {autoAssignTables} from "./assigntables.js";
import {autoAssignJudgeHacks} from "./assignjudgehacks.js";
import {loadTestData} from "./testdata.js";

function logPromise(p : Promise<any>) {
    p.then(r => console.log(r));
}

let sledge : SledgeClient;

export class SetupApp extends React.Component<{}, State> {

  constructor(props:any) {
    super(props)

    sledge = new SledgeClient({
      host: document.location.host
    });
    sledge.subscribeSyncShared(evt => {
      this.setState({
        syncSharedData: evt,
        lastSyncSharedTime: (new Date()).toLocaleString()
      });
    });
    sledge.subscribeStatus(s => {
      this.setState({
        sledgeStatus: s
      });
    });
    logPromise(sledge.sendSetSynchronizeShared({
      syncShared: true
    }));
    (window as any).sledge = sledge;

    let session = getSession();

    this.state = {
      secret: session.secret,
      syncSharedData: undefined,
      lastSyncSharedTime: "never",
      devpostCSV: "",
      hacksOpen: false,
      judgesOpen: false,
      assignedOpen: false,
      sledgeStatus: sledge.status,
      autoAuth: !!localStorage.getItem("autoauth")
    };

    if (localStorage.getItem("autoauth")) {
      this.sendAuth();
    }
  }

  setAuth() {
    setSession({
      secret: this.state.secret
    });
  }

  sendAuth() {
    let authPromise = sledge.sendAuthenticate({
      secret: this.state.secret
    });
    logPromise(authPromise);
  }

  toggleAutoAuth() {
    localStorage.setItem("autoauth",
      this.state.autoAuth ? "" : "1");
    this.setState({
      autoAuth: !this.state.autoAuth
    });
  }

  render() {
    return (
      <Container>
        <h1>{`Setup`}</h1>

        {`This page uses the javacript dev console to log errors and feedback. `}
        {`The sledge client is assigned to `}<code>{`window.sledge`}</code>
        {` if you want to do something fancy.`}

        <h2>{`Status`}</h2>

        <ul>
          <li>
            {`Client Status: `}
            <em>{this.state.sledgeStatus}</em>
          </li>
          <li>
            {`Last Shared Sync: `}<em>{this.state.lastSyncSharedTime}</em>{` (`}
            <a href="javascript:void(0);" onClick={() => console.log(this.state.syncSharedData)}>
              {`Log to Console`}
            </a>{`)`}
          </li>
        </ul>

        <h2>{`Authentication`}</h2>
        <Form>
          <Label>
            {`Secret: `}
            <Input
              value={this.state.secret}
              onChange={evt => this.setState({secret: evt.target.value})}
            />
          </Label>
          <ButtonGroup>
            <Button onClick={() => this.setAuth()}>
              {`Set Secret`}
            </Button>
            <Button onClick={() => this.sendAuth()}>
              {`Authenticate`}
            </Button>
            <Button onClick={() => this.toggleAutoAuth()}>
              {this.state.autoAuth ? "Auto: On" : "Auto: Off"}
            </Button>
          </ButtonGroup>
        </Form>

        <h2>{`Test Data`}</h2>
        <p>{`This will populate the judges, hacks, categories and superlatives with test data.`}</p>
        <ButtonGroup>
          <Button onClick={() => loadTestData(sledge)}>
            {`Load Test Data`}
          </Button>
        </ButtonGroup>

        <h2>{`Manually Add Data`}</h2>
        <AddRow
          name={"Add Judge"}
          fields={List.of("Name", "Email")}
          onAdd={f => logPromise(sledge.sendAddRow({
            table: Table.Judge,
            row: {
              name: f.get(0),
              email: f.get(1),
              active: 1
            }
          }))}
        />
        <AddRow
          name={"Add Hack"}
          fields={List.of("Name", "Description", "Location (number)")}
          onAdd={f => logPromise(sledge.sendAddRow({
            table: Table.Hack,
            row: {
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
          onAdd={f => logPromise(sledge.sendAddRow({
            table: Table.Category,
            row: {
              name: f.get(0)
            }
          }))}
        />
        <AddRow
          name={"Add Superlative"}
          fields={List.of("Name")}
          onAdd={f => logPromise(sledge.sendAddRow({
            table: Table.Superlative,
            row: {
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

        <h2>{`Manage Hacks`}</h2>
        <ButtonGroup>
          <Button
            onClick={() => this.setState((prevState:any) => ({
              hacksOpen: !prevState.hacksOpen && prevState.syncSharedData
            }))}
          >{`Toggle Show Hacks`}</Button>
          <Button
            onClick={() => autoAssignTables(sledge, this.state.syncSharedData.hacks)}
          >{`Auto Assign Tables`}</Button>
        </ButtonGroup>
        {this.state.hacksOpen ? [(
          <TabularActions
            key="table"
            headings={["Id", "Active", "Location", "Name"]}
            rows={
              this.state.syncSharedData.hacks.map((hack:any) => ({
                id: hack.id,
                columns: [
                  hack.id.toString(),
                  hack.active===0 ? "Inactive" : "Active",
                  hack.location.toString(),
                  hack.name
                ]
              }))
            }
            actions={[
              {name: "Toggle Active", cb: id => {
                let hack = this.state.syncSharedData.hacks.find((h:any) => h.id===id);
                logPromise(sledge.sendModifyRow({
                  table: Table.Hack,
                  id,
                  diff: {
                    active: hack.active ? 0 : 1
                  }
                }));
              }},
              {name: "Change Location", cb: id => {
                let hack = this.state.syncSharedData.hacks.find((h:any) => h.id===id);
                logPromise(sledge.sendModifyRow({
                  table: Table.Hack,
                  id,
                  diff: {
                    location: parseInt(
                      prompt("Enter new location (eg. 12)")
                    )
                  }
                }));
              }}
            ]}
          />
        )] : []}

        <h2>{`Manage Judges`}</h2>
        <ButtonGroup>
          <Button
            onClick={() => this.setState((prevState:any) => ({
              judgesOpen: !prevState.judgesOpen && prevState.syncSharedData
            }))}
          >{`Toggle Show Judges`}</Button>
        </ButtonGroup>
        {this.state.judgesOpen ? [(
          <TabularActions
            key="table"
            headings={["Id", "Active", "Name", "Email"]}
            rows={
              this.state.syncSharedData.judges.map((judge:any) => ({
                id: judge.id,
                columns: [
                  judge.id.toString(),
                  judge.active===0 ? "Inactive" : "Active",
                  judge.name,
                  judge.email
                ]
              }))
            }
            actions={[]}
          />
        )] : []}

        <h2>{`Manage Hacks Assigned to Judges`}</h2>
        <ButtonGroup>
          <Button
            onClick={() => this.setState((prevState:any) => ({
              assignedOpen: !prevState.assignedOpen && prevState.syncSharedData
            }))}
          >{`Toggle Assigned Matrix`}</Button>
          <Button
            onClick={() => autoAssignJudgeHacks(sledge, this.state.syncSharedData)}
          >{`Auto Assign All Hacks to All Judges`}</Button>
        </ButtonGroup>
        {this.state.assignedOpen ? [(
          <ToggleMatrix
            key="table"
            columns={this.state.syncSharedData.judges.map(j => j.name)}
            rows={this.state.syncSharedData.hacks.map(h => h.name)}
            matrix={
              this.state.syncSharedData.judgeHackMatrix
            }
            onToggle={(prev,j, h) => logPromise(sledge.sendSetJudgeHackPriority({
              judgeId: j+1,
              hackId: h+1,
              priority: parseInt(prompt("New Priority (eg. 3), or 0 for not assigned"))
            }))}
          />
        )] : []}
      </Container>
    );
  }
}

interface State {
  secret: string;
  syncSharedData: SynchronizeShared;
  lastSyncSharedTime: string;
  devpostCSV: string;
  hacksOpen: boolean;
  judgesOpen: boolean;
  assignedOpen: boolean;
  sledgeStatus: SledgeStatus;
  autoAuth: boolean;
}
