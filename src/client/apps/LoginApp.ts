import React from "react";
import {Socket} from "../Socket";

import {LoginPage, LoginPageProps} from "../components/LoginPage";
import {segue} from "../util";
import {Application} from "../Application";

export class LoginApp extends Application<any> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.state = {
      loading: true,
      judges: []
    };

    this.socket = new Socket();
    this.socket.sendRequest({
      requestName: "REQUEST_GET_JUDGES"
    }).then(res => {
      this.setState({
        judges: res["judges"],
        loading: false
      });
    });
  }

  selectJudge(judgeId: number) {
    localStorage["judgeId"] = judgeId.toString();
    segue("/judge");
  }

  getPageProps(): LoginPageProps {
    return {
      loading: this.state.loading,
      judges: this.state.judges,

      onSelectJudge: id => this.selectJudge(id)
    };
  }

  render() {
    return React.createElement(
      LoginPage,
      this.getPageProps()
    );
  }
}
