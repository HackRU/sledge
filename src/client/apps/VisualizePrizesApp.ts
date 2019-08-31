import React from "react";

import {VisualizePrizesPage, VisualizePrizesPageProps, PrizeTable} from "../components/VisualizePrizesPage";
import {GetFullScoresResponseData} from "../../shared/GetFullScoresRequestTypes";

import {Socket} from "../Socket";

export class VisualizePrizesApp extends React.Component<any, VisualizePrizeAppsState> {
  socket: Socket;

  constructor(props) {
    super(props);

    this.state = {
      response: {
        assignments: [],
        categories: [],
        judges: [],
        prizes: [],
        submissions: []
      }
    };

    this.socket = new Socket();
    this.socket.sendRequest({
      requestName: "REQUEST_GET_FULL_SCORES"
    }).then((response: GetFullScoresResponseData) => {
      console.log(response);

      this.setState({response});
    });
  }

  getPageProps(): VisualizePrizesPageProps {
    return {
      judges: judgeNamesFromResponse(this.state.response),
      prizeTables: prizeTablesFromResponse(this.state.response)
    };
  }

  render() {
    return React.createElement(
      VisualizePrizesPage,
      this.getPageProps()
    );
  }
}

interface VisualizePrizeAppsState {
  response: GetFullScoresResponseData
}

function judgeNamesFromResponse(res: GetFullScoresResponseData): Array<string> {
  return res.judges.map(j => j.name);
}

function prizeTablesFromResponse(res: GetFullScoresResponseData): Array<PrizeTable> {
  return res.prizes.map(prize => {
    const locations = prize.eligibleSubmissions.map(
      submissionIndex => res.submissions[submissionIndex].location
    );

    const judgeLocationStatuses = res.judges.map(
      j => locations.map(l => -1)
    );

    return {
      name: prize.name,
      locations,
      judgeLocationStatuses
    };
  });
}
