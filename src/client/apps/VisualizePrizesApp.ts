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
    return {
      judges: ["Bob", "Sally"],
      prizeTables: [{
        name: "Test Prize",
        locations: [5,8,9],
        judgeLocationStatuses: [
          [1,2,3], [4,5,6]
        ]
      }]
    };
  }

  render() {
    return React.createElement(
      VisualizePrizesPage,
      this.getPageProps()
    );
  }
}
