import React from "react";

import {
  SubmissionManagementPage,
  SubmissionManagementPageProps
} from "../components/SubmissionManagementPage";

import {
  GetFullScoresResponseData,
  getPlaceholderFullScoresResponseData
} from "../../shared/GetFullScoresRequestTypes";

import {Socket} from "../Socket";

export class SubmissionManagementApp extends React.Component<any, SubmissionManagementAppState> {
  socket: Socket;

  constructor(props) {
    super(props);

    this.state = {
      response: getPlaceholderFullScoresResponseData()
    };

    this.socket = new Socket();

    this.socket.sendRequest({
      requestName: "REQUEST_GET_FULL_SCORES"
    }).then((response: GetFullScoresResponseData) => {
      this.setState({response});
    });
  }

  getPageProps(): SubmissionManagementPageProps {
    const ratingInfo = getRatingInformation(this.state.response);

    return {
      submissions: this.state.response.submissions.map((sub, i) => {
        return {
          location: sub.location,
          name: sub.name,
          track: this.state.response.tracks[sub.trackIndex].name,
          averageRating:ratingInfo[i].averageScore,
          normalizedRating: ratingInfo[i].judgeNormalizedAverage
        };
      })
    };
  }

  render() {
    return React.createElement(
      SubmissionManagementPage,
      this.getPageProps()
    );
  }
}

interface SubmissionManagementAppState {
  response: GetFullScoresResponseData
}

interface SubmissionRatingDigest {
  totalScore: number;
  averageScore: number;
  judgeNormalizedAverage: number;
  totalCompletedRatings: number;
}

function getRatingInformation(response: GetFullScoresResponseData): Array<SubmissionRatingDigest> {
  const normalizationFactors = calculateJudgeNormalizationFactors(response);
  const rawScores: Array<Array<number>> = response.submissions.map(s => []);
  const normalizedScores: Array<Array<number>> = response.submissions.map(s => []);
  const activeAssignments: Array<number> = response.submissions.map(s => 0);

  for (let ass of response.assignments) {
    if (ass.type === 1) {
      if (!ass.active && !ass.noShow) {
        rawScores[ass.submissionIndex].push(ass.rating);
        normalizedScores[ass.submissionIndex].push(normalizationFactors[ass.judgeIndex] * ass.rating);
      } else {
        activeAssignments[ass.submissionIndex]++;
      }
    }
  }

  return response.submissions.map((sub, i) => {
    const totalCompletedRatings = rawScores[i].length;
    const totalScore = rawScores[i].reduce((a,b) => a+b, 0);
    const averageScore = totalScore > 0 ? totalScore / totalCompletedRatings : 0;
    const judgeNormalizedTotal = normalizedScores[i].reduce((a,b) => a+b, 0);
    const judgeNormalizedAverage = judgeNormalizedTotal > 0 ? judgeNormalizedTotal / totalCompletedRatings : 0;

    return {
      totalScore,
      averageScore,
      judgeNormalizedAverage,
      totalCompletedRatings
    };
  });
}


function calculateJudgeNormalizationFactors(response: GetFullScoresResponseData): Array<number> {
  const judgeScores: Array<Array<number>> = response.judges.map(j => []);
  for (let ass of response.assignments) {
    if (ass.type === 1) {
      if (!ass.active) {
        judgeScores[ass.judgeIndex].push(ass.rating);
      }
    }
  }

  return judgeScores.map((scores) => {
    const sum = scores.reduce((a,b) => a+b, 0);
    if (sum === 0) {
      return 0;
    } else {
      return 20 * scores.length/sum;
    }
  });
}
