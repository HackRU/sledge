import React from "react";

import {
  VisualizePrizesPage,
  VisualizePrizesPageProps,
  PrizeTable,
  JudgeSubmissionStatus
} from "../components/VisualizePrizesPage";
import {
  GetFullScoresResponseData,
  getPlaceholderFullScoresResponseData
} from "../../shared/GetFullScoresRequestTypes";

import {Socket} from "../Socket";
import {Application} from "../Application";

export class VisualizePrizesApp extends Application<VisualizePrizeAppsState> {
  socket: Socket;

  constructor(props: any) {
    super(props);

    this.state = {
      response: getPlaceholderFullScoresResponseData()
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
  const statusMap: Array<Array<Array<{
    prizeIndex: number,
    statusObj: JudgeSubmissionStatus
  }>>> = res.submissions.map(
    sub => res.judges.map(j => [])
  );

  // Initialize prize tables and populate submissionIndexStatuses map
  const prizeTables: Array<PrizeTable> = [];
  for (let i=0;i<res.prizes.length;i++) {
    const prize = res.prizes[i];

    const statuses: Array<Array<{status: string, score: string}>> = res.judges.map(j => []);
	console.log(statuses);
    for (let eligibleSubmissionIndex of prize.eligibleSubmissions) {
      for (let j=0;j<res.judges.length;j++) {
        const statusObj = {
	        status: "JSSTATUS_NONE",
	        score: ""
        };

        statuses[j].push(statusObj);
        statusMap[eligibleSubmissionIndex][j].push({
          prizeIndex: i,
          statusObj
        });
      }
    }

    prizeTables.push({
      name: prize.name,
      locations: prize.eligibleSubmissions.map(
        submissionIndex => res.submissions[submissionIndex].location
      ),
      statuses
    });
  }

  for (let ass of res.assignments) {
    if (ass.type === 1) {
      const statuses = statusMap[ass.submissionIndex!][ass.judgeIndex];
      for (let status of statuses) {
        status.statusObj.status = ass.active ? "JSSTATUS_ACTIVE" : (
          ass.noShow ? "JSSTATUS_NOSHOW" : "JSSTATUS_COMPLETE"

	  );
	  status.statusObj.score = ass.rating ? (ass.rating * 100) + "" : "0";

      }
    }
  }

  console.log(prizeTables);

  return prizeTables;
}
