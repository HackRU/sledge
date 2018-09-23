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
  Judge,
  Superlative,
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

        <h2>{`Superlative Rankings`}</h2>
        <Table>
          <thead>
            <tr>
              <th>{`Superlative`}</th>
              <th>{`Score`}</th>
              <th>{`Hack`}</th>
              <th>{`Loc`}</th>
            </tr>
          </thead>
          <tbody>
            {getSuperlativeWinners(this.state.syncData).map((r,i) => r.score > 0 ? (
              <tr key={i}>
                <td>{i%5 === 0 ? (<b>{r.superlative.name}</b>) : []}</td>
                <td>{r.score}</td>
                <td>{r.hack.name}</td>
                <td>{r.hack.location}</td>
              </tr>
            ) : (
              <tr key={i}>
                <td>{i%5 === 0 ? (<b>{r.superlative ? r.superlative.name : "???"}</b>) : []}</td>
                <td>{`0`}</td>
                <td />
                <td />
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

interface SuperlativeWinner {
  hack: Row<Hack>;
  superlative: Row<Superlative>;
  score: number;
}

function getSuperlativeWinners(sync: Synchronize): Array<SuperlativeWinner> {
  if (!sync || !sync.superlativePlacements) return [];

  // superlatives[superlativeId-1]
  let superlatives: Array<Row<Superlative>> = [];
  // hacks[hackId-1]
  let hacks: Array<Row<Hack>> = [];
  // judges[judgeId-1]
  let judges: Array<Row<Judge>> = [];

  for (let superlative of sync.superlatives) superlatives[superlative.id] = superlative;
  for (let hack of sync.hacks) hacks[hack.id] = hack;
  for (let judge of sync.judges) judges[judge.id] = judge;

  // Reformat in scores matrix
  // scores[superlativeId-1][hackId-1]
  let scores: number[][] = new Array(superlatives.length-1);
  for (let superlativeId=1;superlativeId<=superlatives.length;superlativeId++) {
    scores[superlativeId-1] = new Array(hacks.length-1);
    for (let hackId=1;hackId<=hacks.length;hackId++) {
      scores[superlativeId-1][hackId-1] = 0;
    }
  }

  for (let judgeId=1;judgeId<judges.length;judgeId++) {
    for (let superlativeId=1;superlativeId<superlatives.length;superlativeId++) {
      let placement = sync.superlativePlacements[judgeId-1][superlativeId-1];
      if (placement.firstChoiceId === placement.secondChoiceId) {
        if (placement.firstChoiceId > 0) scores[superlativeId-1][placement.firstChoiceId-1] += 2;
      } else {
        if (placement.firstChoiceId > 0)  scores[superlativeId-1][placement.firstChoiceId-1] += 2;
        if (placement.secondChoiceId > 0) scores[superlativeId-1][placement.secondChoiceId-1] += 1;
      }
    }
  }

  // For each superlative, get top 5 winners
  let winners: Array<SuperlativeWinner> = [];
  type HackScore = { hackId: number, score: number };
  for (let superlativeId=1;superlativeId<superlatives.length;superlativeId++) {
    // Sort by score
    let sorted = scores[superlativeId-1].map((s,h) => ({
      score: s,
      hackId: h+1
    })).sort((a,b) => b.score - a.score);

    // Get 5 best, or add dummies if <5
    for (let i=0;i<5;i++) {
      if (sorted.length > i && sorted[i].score > 0) {
        if (superlativeId >= superlatives.length) console.log(superlativeId);
        console.log(superlatives);
        winners.push({
          superlative: superlatives[superlativeId],
          hack: hacks[sorted[i].hackId],
          score: sorted[i].score
        });
      } else {
        winners.push({
          superlative: superlatives[superlativeId],
          hack: null,
          score: 0
        });
      }
    }
  }

  console.log(winners);

  return winners;
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
