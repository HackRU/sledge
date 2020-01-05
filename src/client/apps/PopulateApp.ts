import React from "react";

import {PopulatePage, PopulatePageProps} from "../components/PopulatePage";
import {range} from "../../shared/util";
import {Socket} from "../Socket";
import {getSetupData, setSetupData, resetSetupData, SetupData} from "../ClientStorage";

import {PopulateRequestData} from "../../shared/PopulateRequestTypes";

export class PopulateApp extends React.Component<any, PopulateState> {
  socket: Socket;

  constructor(props: any) {
    super(props);
    this.socket = new Socket();

    let setupData = getSetupData();
    this.state = {
      setupData,
      json: JSON.stringify(setupData),
      response: ""
    };
  }

  alterSetupData(f: (data: SetupData) => SetupData) {
    let oldSetupData = this.state.setupData;
    let newSetupData = f({ ...oldSetupData });

    this.setState({
      setupData: newSetupData,
      json: JSON.stringify(newSetupData)
    });
    setSetupData(newSetupData);
  }

  reloadSetupData() {
    let newSetupData = getSetupData();
    this.setState({
      setupData: newSetupData,
      json: JSON.stringify(newSetupData)
    });
  }

  reset() {
    resetSetupData();
    this.reloadSetupData();
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
      location: s.location
    }));
    let judges = this.state.setupData.judges.map(name => ({name}));
    let categories = this.state.setupData.categories.map(name => ({name}));
    let prizes = this.state.setupData.prizes.map(name => ({name}));
    let submissionPrizes = this.state.setupData.submissions.reduce(
      (subPrs, sub, subIdx) => subPrs.concat(
        sub.prizes.map(prizeIdx => ({
          submission: subIdx,
          prize: prizeIdx
        })) as any
      ), []
    );

    let requestData: PopulateRequestData = {
      requestName: "REQUEST_POPULATE",
      submissions,
      judges,
      categories,
      prizes,
      submissionPrizes
    }

    this.socket.sendRequest(requestData).then(res => {
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

  getPageProps(): PopulatePageProps {
    return {
      json: this.state.json,
      status: this.state.response,
      submissions: this.state.setupData.submissions,
      prizes: this.state.setupData.prizes.map(name => ({name})),
      judges: this.state.setupData.judges.map(name => ({name})),
      categories: this.state.setupData.categories.map(name => ({name})),

      onLoadFromJson: json => this.alterSetupData(old => JSON.parse(json)),
      onReset: () => this.reset(),
      onReloadFromLocalStorage: () => this.alterSetupData(old => getSetupData()),
      onRemoveSubmission: idx => this.removeHack(idx),
      onAssignSubmissionAllPrizes: idx => this.assignAllPrizesToHack(idx),
      onChangeSubmissionLocation: (idx, loc) => this.changeTableNumber(idx, loc),
      onRemovePrize: idx => this.removePrize(idx),
      onRenamePrize: (idx, name) => this.renamePrize(idx, name),
      onAddJudge: name => this.addJudge(name),
      onRemoveJudge: idx => this.removeJudge(idx),
      onAddCategory: name => this.addCategory(name),
      onRemoveCategory: idx => this.removeCategory(idx),
      onPopulateServer: () => this.populateServer(),
      onStartJudging: () => this.startJudging()
    };
  }

  render() {
    return React.createElement(
      PopulatePage,
      this.getPageProps()
    );
  }
}

interface PopulateState {
  setupData: SetupData;
  json: string;
  response: string;
}
