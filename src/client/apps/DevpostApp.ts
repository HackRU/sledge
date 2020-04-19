import React from "react";

import {DevpostPage, DevpostPageProps} from "../components/DevpostPage";
import {Socket} from "../Socket";
import {getSetupData, setSetupData} from "../ClientStorage";
import {
  parseDevpostData,
  DevpostData,
  mergeDevpostToSetupData
} from "../Devpost";
import {Application} from "../Application";

export class DevpostApp extends Application<any> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();

    this.state = {
      status: "nothing to report"
    };
  }

  private importCsv(csv: string) {
    let devpost = parseDevpostData(csv);
    if (devpost.error !== null) {
      console.warn(`parseDevpostData error: ${devpost.error}`);
      console.warn(devpost);

      this.setState({
        status: `${devpost.error} (object logged to console)`
      });

      return;
    }

    let oldSetup = getSetupData();
    let newSetup = mergeDevpostToSetupData(devpost, oldSetup);
    let newPrizes = newSetup.prizes.length - oldSetup.prizes.length;
    let newSubmissions = newSetup.submissions.length - oldSetup.submissions.length;

function convertDevpostToSetupData(devpostData: DevpostData) {
  return {
    prizes: devpostData.prizes,
    submissions: devpostData.submissions.map(d => ({
      name: d.name,
      location: d.table,
      prizes: d.prizes
    }))
  };
}

    setSetupData(newSetup);
    this.setState({
      status: `Successfully imported ${newSubmissions} new submissions and ${newPrizes} new prizes`
    });
  }

  getPageProps(): DevpostPageProps {
    return {
      status: this.state.status,
      onImport: csv => this.importCsv(csv)
    };
  }

  render() {
    return React.createElement(
      DevpostPage,
      this.getPageProps()
    );
  }
}
