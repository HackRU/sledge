import React from "react";
import {Socket} from "../Socket";

import {LoginPage, LoginPageProps} from "../components/LoginPage";

export class LoginApp extends React.Component<any,any> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.state = {
      loading: true,
      judges: []
    };

    this.socket = new Socket();
    this.socket.sendRequest({
      requestName: "GET_JUDGES"
    }).then(res => {
      this.setState({
        judges: res["judges"],
        loading: false
      });
    });
  }

  selectJudge(judgeId: number) {
    localStorage["judgeId"] = judgeId.toString();
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
