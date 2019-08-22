import React from "react";

import {VisualizeRatingsPage} from "../components/VisualizeRatingsPage";

import {Socket} from "../Socket";

export class VisualizeRatingsApp extends React.Component<any, any> {
  socket: Socket;

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      response: null
    };

    this.socket = new Socket();
  }

  loadVisualization() {
    this.setState({
      ready: false
    });

    this.socket.sendRequest({
      requestName: "REQUEST_GET_RATING_SCORES"
    }).then(response => {
      this.setState({
        ready: true,
        response
      });
    });
  }

  render() {
    return React.createElement(
      VisualizeRatingsPage,
      {
        ready: this.state.ready,
        response: this.state.response,
        onLoadVisualization: this.loadVisualization.bind(this)
      }
    );
  }
}
