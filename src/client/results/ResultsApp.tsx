import React from "react";

import {
  Container,
  Table,
  Alert
} from "reactstrap";

import {
  SynchronizeGlobal as Synchronize
} from "../../protocol/events.js";

import {
  Hack,
  PartialTable,
  Row
} from "../../protocol/database.js";

import {SledgeClient} from "../sledge.js";

let sledge : SledgeClient;

export class ResultsApp extends React.Component<{}, State> {
  constructor(props:any) {
    super(props);
    this.state = {
      syncData: undefined
    };

    sledge = new SledgeClient({
      host: document.location.host
    });
    sledge.subscribeSyncGlobal(s => {
      console.log(s);
      this.setState({ syncData: s });
    });
    console.log(sledge);
    sledge.sendAuthenticate({
      secret: localStorage.getItem("secret")
    }).then(r => {
      console.log(r);
      if (!r.success) {
        alert(`Could not authenticate: ${r.message}`);
      }

      sledge.sendSetSynchronizeGlobal({
        syncShared: true
      }).then(r => {
        if (!r.success) {
          alert(`Could not set synchronize: ${r.message}`);
        }
      });
    });
  }

  handleSync(data: Synchronize) {
    this.setState({ syncData: data });
  }

  render(): JSX.Element {
    return (
      <Container>
        <h1>{`Hack Results`}</h1>

        <h2>{`Overall Ranking`}</h2>

        <Table>
          <thead>
            <tr>
              <th>{`Loc`}</th>
              <th>{`Name`}</th>
              <th>{`Avg`}</th>
              <th>{`Status`}</th>
            </tr>
          </thead>
          <tbody>
            {getOverallWinners(this.state.syncData).map(w => (
              <tr key={w.info.id}>
                <td>{w.info.location}</td>
                <td>{w.info.name}</td>
                <td>{w.overall}</td>
                <td>{w.totalFinished}{` / `}{w.totalJudges}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  }
}

interface State {
  syncData: Synchronize
}

function getOverallWinners(sync: Synchronize): Array<{ overall: number, info: Row<Hack>, totalJudges: number, totalFinished: number }> {
  if (!sync || !sync.ratings) return [];

  return sync.hacks.map(h => {
    // First, figure out what judges are assigned to this Hack
    let assignedJudges: number[] = [];
    for (let judgeId=1;judgeId<=sync.judgeHackMatrix.length;judgeId++) {
      if (sync.judgeHackMatrix[judgeId-1][h.id-1] > 0) {
        assignedJudges.push(judgeId);
      }
    }

    // Which judges are finished judging this hack, and whats the overall?
    let overalls: number[] = [];
    for (let judgeId of assignedJudges) {
      let overall = 0;
      let unfinished = false;
      for (let catRating of sync.ratings[judgeId-1][h.id-1]) {
        overall += catRating > 5 ? 5 : catRating;
        unfinished = unfinished || catRating <= 0;
      }

      overalls.push(unfinished ? 0 : overall);
    }

    let overall = 0;
    let totalFinished = 0;
    for (let o of overalls) {
      if (o > 0) {
        overall += o;
        totalFinished++;
      }
    }
    overall = totalFinished > 0 ? overall / totalFinished : 0;

    return {
      overall,
      totalFinished,
      totalJudges: assignedJudges.length,
      info: h,
    };
  }).sort((a, b) => {
    if (a.overall > b.overall) {
      return -1;
    } else if (a.overall < b.overall)  {
      return 1;
    } else {
      return a.info.id - b.info.id;
    }
  });
}

function average(xs: number[]): number {
  if (xs.length === 0) {
    return 0;
  }

  let sum = 0;
  for (let i=0;i<xs.length;i++) {
    sum += xs[i];
  }

  return sum / xs.length;
}

function sum(xs: number[]): number {
  let sum = 0;
  for (let i=0;i<xs.length;i++) {
    sum += xs[i];
  }
  return sum;
}
