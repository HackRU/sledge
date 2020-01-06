import React from "react";

import {PopulatePage, PopulatePageProps} from "../components/PopulatePage";
import {range} from "../../shared/util";
import {Socket} from "../Socket";
import {getSetupData, setSetupData, resetSetupData} from "../ClientStorage";
import {SetupData, renamePrize, addCategory, getSubmissionPrizes, expandCategory, assignPrizeToAll, addPrize} from "../SetupData";

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

  addJudge(name: string) {
    this.alterSetupData(old => ({
      ...old,
      judges: old.judges.concat([{name}])
    }));
  }

  removeJudge(index: number) {
    this.alterSetupData(old => ({
      ...old,
      judges: old.judges.filter((j,i) => i !== index)
    }));
  }

  removeCategory(index: number) {
    this.alterSetupData(old => ({
      ...old,
      categories: old.categories.filter((c,i) => i !== index)
    }));
  }

  addTrack (name: string) {
    this.alterSetupData(old => ({
      ...old,
      tracks: old.tracks.concat([{name}])
    }))
  }

  removeTrack(index: number) {
    this.alterSetupData(old => {
      for (let sub of old.submissions) {
        if (sub.track === index) {
          alert(`Can't remove track: submission ${sub.name} uses it`);
          return old;
        }
      }

      return {
        ...old,
        tracks: old.tracks.filter((_t,i) => i !== index),
        submissions: old.submissions.map(sub => ({
          ...sub,
          track: sub.track > index ? sub.track - 1 : sub.track
        }))
      };
    });
  }

  renameTrack(index: number, name: string) {
    this.alterSetupData(old => ({
      ...old,
      tracks: old.tracks.map((t, i) => i === index ? {name} : t)
    }));
  }

  convertPrizeToTrack(przIndex: number) {
    this.alterSetupData(old => ({
      ...old,
      tracks: old.tracks.concat([old.prizes[przIndex]]),
      submissions: old.submissions.map(sub => ({
        ...sub,
        track: sub.prizes.indexOf(przIndex) < 0 ?
          sub.track : old.tracks.length
      }))
    }));
  }

  populateServer() {
    let requestData: PopulateRequestData = {
      requestName: "REQUEST_POPULATE",
      ...this.state.setupData,
      submissionPrizes: getSubmissionPrizes(this.state.setupData)
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
      prizes: this.state.setupData.prizes,
      judges: this.state.setupData.judges,
      categories: this.state.setupData.categories,
      tracks: this.state.setupData.tracks,

      onLoadFromJson: json => this.alterSetupData(old => JSON.parse(json)),
      onReset: () => this.reset(),
      onReloadFromLocalStorage: () => this.alterSetupData(old => getSetupData()),
      onRemoveSubmission: idx => this.removeHack(idx),
      onAssignSubmissionAllPrizes: idx => this.assignAllPrizesToHack(idx),
      onChangeSubmissionLocation: (idx, loc) => this.changeTableNumber(idx, loc),
      onAddPrize: name => this.alterSetupData(addPrize.bind(null, name)),
      onRemovePrize: idx => this.removePrize(idx),
      onRenamePrize: (idx, name) => this.alterSetupData(renamePrize.bind(null, idx, name)),
      onAssignPrizeToAll: idx => this.alterSetupData(assignPrizeToAll.bind(null, idx)),
      onAddJudge: name => this.addJudge(name),
      onRemoveJudge: idx => this.removeJudge(idx),
      onAddCategory: name => this.alterSetupData(addCategory.bind(null, name)),
      onRemoveCategory: idx => this.removeCategory(idx),
      onExpandCategory: idx => this.alterSetupData(expandCategory.bind(null, idx)),
      onAddTrack: this.addTrack.bind(this),
      onRemoveTrack: this.removeTrack.bind(this),
      onRenameTrack: this.renameTrack.bind(this),
      onConvertPrizeToTrack: this.convertPrizeToTrack.bind(this),
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
