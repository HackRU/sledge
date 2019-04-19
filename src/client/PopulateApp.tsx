import React from "react";

import {
  Container,
  Input,
  ButtonGroup,
  Button
} from "reactstrap";

import {range} from "../shared/util";

import {TextSubmit} from "./TextSubmit";
import {Hideable} from "./Hideable";
import {TabularActions} from "./TabularActions";
import {InputItem} from "./InputItem";

import {Socket} from "./Socket";

export class PopulateApp extends React.Component<any, PopulateState> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();

    let setupData = getDefaultSetupData();

    let localStorageJson = localStorage["setup"];
    if (localStorageJson) {
      setupData = {...setupData, ...JSON.parse(localStorageJson)}
    }

    this.state = {
      setupData,
      json: JSON.stringify(setupData),
      response: ""
    };
  }

  loadFromJson(json) {
    this.alterSetupData(d => ({
      ...getDefaultSetupData(),
      ...JSON.parse(json)
    }));
  }

  reloadFromLocalStorage() {
    let data = JSON.parse(localStorage["setup"]);
    this.setState({
      setupData: data
    });
  }

  alterSetupData(f: (data: SetupData) => SetupData) {
    let oldSetupData = this.state.setupData;
    let newSetupData = f({ ...oldSetupData });

    this.setState({
      setupData: newSetupData,
      json: JSON.stringify(newSetupData)
    });
    this.saveToLocalStorage(newSetupData);
  }

  saveToLocalStorage(setupData: SetupData) {
    localStorage["setup"] = JSON.stringify(setupData);
  }

  reset() {
    this.alterSetupData(d => getDefaultSetupData());
  }

  removeHack(index: number) {
    this.alterSetupData(old => ({
      ...old,
      submissions: old.submissions.filter((x,i) => i !== index)
    }));
  }

  assignAllPrizesToHack(index: number) {
    this.alterSetupData(old => ({
      ...old,
      submissions: old.submissions.map((s,i) => i !== index ? s :
        { ...s, prizes: range(old.prizes.length) }
      )
    }));
  }

  changeTableNumber(index: number, table: number) {
    this.alterSetupData(old => ({
      ...old,
      submissions: old.submissions.map((s,i) => i !== index ? s :
        { ...s, table }
      )
    }));
  }

  removePrize(index: number) {
    this.alterSetupData(old => ({
      ...old,
      submissions: old.submissions.map((s,i)=> ({
        ...s,
        prizes: s.prizes.filter(p => p !== index).map(p => p > index ? p-1 : p)
      })),
      prizes: old.prizes.filter((s,i) => i !== index)
    }));
  }

  renamePrize(index: number, newName: string) {
    this.alterSetupData(old => ({
      ...old,
      prizes: old.prizes.map((p,i) => i === index ? newName : p)
    }));
  }

  addJudge(name: string) {
    this.alterSetupData(old => ({
      ...old,
      judges: old.judges.concat([name])
    }));
  }

  removeJudge(index: number) {
    this.alterSetupData(old => ({
      ...old,
      judges: old.judges.filter((j,i) => i !== index)
    }));
  }

  addCategory(name: string) {
    this.alterSetupData(old => ({
      ...old,
      categories: old.categories.concat([name])
    }));
  }

  removeCategory(index: number) {
    this.alterSetupData(old => ({
      ...old,
      categories: old.categories.filter((c,i) => i !== index)
    }));
  }

  populateServer() {
    let submissions = this.state.setupData.submissions.map(s => ({
      name: s.name,
      location: s.table
    }));
    let judges = this.state.setupData.judges.map(name => ({name}));
    let categories = this.state.setupData.categories.map(name => ({name}));
    let prizes = this.state.setupData.prizes.map(name => ({name}));
    let submissionPrizes = this.state.setupData.submissions.reduce(
      (subPrs, sub, subIdx) => subPrs.concat(
        sub.prizes.map(prizeIdx => ({
          submission: subIdx,
          prize: prizeIdx
        }))
      ), []
    );

    this.socket.sendRequest({
      requestName: "REQUEST_POPULATE",
      submissions,
      judges,
      categories,
      prizes,
      submissionPrizes
    }).then(res => {
      this.setState({
        response: JSON.stringify(res)
      });
    });
  }

  startJudging() {
    this.socket.sendRequest({
      requestName: "REQUEST_BEGIN_JUDGING"
    }).then(res => {
      this.setState({
        response: JSON.stringify(res)
      });
    });
  }

  render() {
    return (
      <Container id="PopulateApp">
        <h1>{`Populate Data`}</h1>

        <h2>{`Load Data`}</h2>

        <InputItem
          name="From JSON"
          fields={["JSON Data"]}
          onAdd={d => this.loadFromJson(d)}
        />

        <ButtonGroup>
          <Button
            onClick={() => this.reloadFromLocalStorage()}
          >{`Reload from LocalStorage`}</Button>
          <Button
            onClick={() => this.reset()}
          >{`Reset`}</Button>
        </ButtonGroup>

        <h2>{`Submissions`}</h2>

        <Hideable initiallyHidden={true}>
          <TabularActions
            headings={["Table", "Name", "Prizes"]}
            rows={this.state.setupData.submissions.map((s, i) => ({
              columns: [
                s.table.toString(),
                s.name,
                s.prizes.map(idx => this.state.setupData.prizes[idx]).join(",")
              ],
              id: i
            }))}
            actions={[{
              name: "Remove",
              cb: i => this.removeHack(i)
            }, {
              name: "Assign All Prizes",
              cb: i => this.assignAllPrizesToHack(i)
            }, {
              name: "Change Table Number",
              cb: i => {
                let newTable = parseInt(prompt("New Table Number:"));
                if (Number.isNaN(newTable) || newTable < 1) {
                  alert("Bad Table Number");
                } else {
                  this.changeTableNumber(i, newTable);
                }
              }
            }]}
          />
        </Hideable>

        <h2>{`Prizes`}</h2>

        <Hideable initiallyHidden={true}>
          <TabularActions
            headings={["Name"]}
            rows={this.state.setupData.prizes.map((p, i) => ({
              columns: [p],
              id: i
            }))}
            actions={[{
              name: "Remove",
              cb: i => this.removePrize(i)
            }, {
              name: "Rename",
              cb: i => this.renamePrize(i, prompt("New Prize Name:"))
            }]}
          />
        </Hideable>

        <h2>{`Judges`}</h2>

        <ButtonGroup>
          <Button
            onClick={() => this.addJudge(prompt("Name for Judge:"))}
          >{`Add`}</Button>
        </ButtonGroup>

        <Hideable initiallyHidden={true}>
          <TabularActions
            headings={["Name"]}
            rows={this.state.setupData.judges.map((j, i) => ({
              columns: [j],
              id: i
            }))}
            actions={[{
              name: "Remove",
              cb: i => this.removeJudge(i)
            }]}
          />
        </Hideable>

        <h2>{`Categories`}</h2>

        <ButtonGroup>
          <Button
            onClick={() => this.addCategory(prompt("Name for Category:"))}
          >{`Add`}</Button>
        </ButtonGroup>

        <Hideable initiallyHidden={true}>
          <TabularActions
            headings={["Name"]}
            rows={this.state.setupData.categories.map((c, i) => ({
              columns: [c],
              id: i
            }))}
            actions={[{
              name: "Remove",
              cb: i => this.removeCategory(i)
            }]}
          />
        </Hideable>

        <h2>{`Populate on Server`}</h2>

        <ButtonGroup>
          <Button
            onClick={() => this.populateServer()}
          >{`Populate Server`}</Button>
          <Button
            onClick={() => this.startJudging()}
          >{`Start Judging`}</Button>
        </ButtonGroup>

        <Input
          type="textarea"
          readOnly
          value={this.state.json}
        />

        <Input
          type="textarea"
          readOnly
          value={this.state.response}
        />

      </Container>
    );
  }
}

function getDefaultSetupData(): SetupData {
  return {
    submissions: [],
    prizes: [],
    judges: [],
    categories: []
  };
}

interface SetupData {
  submissions: Array<{ name: string, table: number, prizes: Array<number> }>;
  prizes: Array<string>;
  judges: Array<string>;
  categories: Array<string>;
}

interface PopulateState {
  setupData: SetupData;
  json: string;
  response: string;
}
