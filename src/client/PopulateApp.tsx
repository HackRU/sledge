import React from "react";

import {
  Container,
  Input,
  ButtonGroup,
  Button
} from "reactstrap";

import {TextSubmit} from "./TextSubmit";
import {Hideable} from "./Hideable";
import {TabularActions} from "./TabularActions";
import {InputItem} from "./InputItem";

import {Socket} from "./Socket";

export class PopulateApp extends React.Component<any, {setupData: SetupData}> {
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
      setupData
    };
  }

  loadFromJson(json) {
    let data = {
      ...getDefaultSetupData(),
      ...JSON.parse(json)
    };
    this.setState({
      setupData: data
    });
    this.saveToLocalStorage(data);
  }

  reloadFromLocalStorage() {
    let data = JSON.parse(localStorage["setup"]);
    this.setState({
      setupData: data
    });
  }

  reset() {
    let setupData = getDefaultSetupData();
    this.setState({
      setupData: setupData
    });
    this.saveToLocalStorage(setupData);
  }

  saveToLocalStorage(setupData: SetupData) {
    localStorage["setup"] = JSON.stringify(setupData);
  }

  removeHack(index: number) {
    let oldSetupData = this.state.setupData;
    let newSetupData = {
      ...oldSetupData,
      submissions: oldSetupData.submissions.filter((x,i) => i !== index)
    };

    this.setState({ setupData: newSetupData });
    this.saveToLocalStorage(newSetupData);
  }

  assignAllPrizesToHack(index: number) {
    let allPrizeIndexes = [];
    for (let i=0;i<this.state.setupData.prizes.length;i++) {
      allPrizeIndexes.push(i);
    }

    let oldSetupData = this.state.setupData;
    let newSetupData = {
      ...oldSetupData,
      submissions: oldSetupData.submissions.map((s,i) => i !== index ? s :
        { ...s, prizes: allPrizeIndexes }
      )
    };

    this.setState({ setupData: newSetupData });
    this.saveToLocalStorage(newSetupData);
  }

  changeTableNumber(index: number, table: number) {
    let oldSetupData = this.state.setupData;
    let newSetupData = {
      ...oldSetupData,
      submissions: oldSetupData.submissions.map((s,i) => i !== index ? s :
        { ...s, table }
      )
    };

    this.setState({ setupData: newSetupData });
    this.saveToLocalStorage(newSetupData);
  }

  removePrize(index: number) {
    let oldSetupData = this.state.setupData;
    let newSetupData = {
      ...oldSetupData,
      submissions: oldSetupData.submissions.map((s,i) => ({
        ...s,
        prizes: s.prizes
          .filter(p => p !== index)
          .map(p => p > index ? p-1 : p)
      })),
      prizes: oldSetupData.prizes.filter((s,i) => i !== index)
    };

    this.setState({ setupData: newSetupData });
    this.saveToLocalStorage(newSetupData);
  }

  renamePrize(index: number, newName: string) {
    let oldSetupData = this.state.setupData;
    let newSetupData = {
      ...oldSetupData,
      prizes: oldSetupData.prizes.map((p,i) => i === index ? newName : p)
    };

    this.setState({ setupData: newSetupData });
    this.saveToLocalStorage(newSetupData);
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
