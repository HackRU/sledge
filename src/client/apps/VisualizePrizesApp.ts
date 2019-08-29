import React from "react";

import {VisualizePrizesPage, VisualizePrizesPageProps} from "../components/VisualizePrizesPage";

import {Socket} from "../Socket";

export class VisualizePrizesApp extends React.Component {
  socket: Socket;

  constructor(props) {
    super(props);

    this.socket = new Socket();
    this.socket.sendRequest({
      requestName: "REQUEST_GET_FULL_SCORES"
    }).then(response => {
      console.log(response);
    });
  }

  getPageProps(): VisualizePrizesPageProps {
    return {};
  }

  render() {
    return React.createElement(
      VisualizePrizesPage,
      this.getPageProps()
    );
  }
}
