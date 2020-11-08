import React from "react";

import {VisualizeRatingsPage} from "../components/VisualizeRatingsPage";

import {Socket} from "../Socket";
import {GetRatingScoresRequestResponseData} from "../../shared/GetRatingScoresRequestTypes";
import {VisualizeRatingsPageProps} from "../components/VisualizeRatingsPage";
import {Application} from "../Application";

export class VisualizeRatingsApp extends Application<VisualizeRatingsAppState> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.state = {
      lastUpdateTimestamp: 0,
      lastResponse: {
        submissions: [],
        judges: [],
        scores: []
      }
    };

    this.socket = new Socket();

    this.loadVisualization();
  }

  loadVisualization() {
    this.socket.sendRequest({
      requestName: "REQUEST_GET_RATINGS_SCORES"
    }).then((response: GetRatingScoresRequestResponseData) => {
      this.setState({
        lastUpdateTimestamp: Date.now(),
        lastResponse: response
      });
    });
  }

  getPageProps(): VisualizeRatingsPageProps {
    return {
      response: this.state.lastResponse,
      timestamp: this.state.lastUpdateTimestamp,

      onReload: () => this.loadVisualization()
    };
  }

  render() {
    return React.createElement(
      VisualizeRatingsPage,
      this.getPageProps()
    );
  }
}

interface VisualizeRatingsAppState {
  lastUpdateTimestamp: number;
  lastResponse: GetRatingScoresRequestResponseData;
}
