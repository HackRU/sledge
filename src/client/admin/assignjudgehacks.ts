import {SledgeClient} from "../SledgeClient";
import {SynchronizeGlobal, GenericResponse} from "../../protocol/events";

export function autoAssignJudgeHacks(sledge: SledgeClient, syncShared: SynchronizeGlobal) {
  let hacks = syncShared.hacks.filter(h => h.active).sort((h1,h2) => {
    if (h1.location !== h2.location) {
      return h1.location - h2.location;
    } else {
      return h1.id - h2.id;
    }
  });
  let judges = syncShared.judges.filter(j => j.active);

  let reqs: Array<Promise<GenericResponse>> = [];
  hacks.forEach((hack,i) => {
    judges.forEach(judge => {
      sledge.sendSetJudgeHackPriority({
        judgeId: judge.id,
        hackId: hack.id,
        priority: i+1
      });
    });
  });

  Promise.all(reqs).then(res => {
    for (let r of res) {
      if (!r.success) {
        throw new Error("Not successful!");
      }
    }

    console.log("Success!");
  });
}

export function autoAssignJudgeHacksBetter(client: SledgeClient, syncGlobal: SynchronizeGlobal) {
  let hacks = syncGlobal.hacks.filter(h => h && h.active).sort((h1,h2) => h1.id-h2.id);
  let judges = syncGlobal.judges.filter(j => j && j.active).sort((j1,j2) => j1.id-j2.id);
  let assignments = judgeAssignments(hacks.length, judges.length, 3);

  let reqs: Array<Promise<GenericResponse>> = [];
  assignments.forEach((a, j) => {
    a.forEach((h, p) => {
      reqs.push(client.sendSetJudgeHackPriority({
        judgeId: judges[j].id,
        hackId: hacks[h].id,
        priority: p+1
      }));
    });
  });

  Promise.all(reqs).then(res => {
    for (let r of res) {
      if (!r.success) {
        throw new Error("Not successful!");
      }
    }

    console.log("Success!");
  });
}

export function removeJudgeHackAssignments(client: SledgeClient, syncGlobal: SynchronizeGlobal) {
  let reqs: Array<Promise<GenericResponse>> = [];
  syncGlobal.judges.filter(j => !!j).forEach(judge => {
    syncGlobal.hacks.filter(h => !!h).forEach(hack => {
      reqs.push(client.sendSetJudgeHackPriority({
        judgeId: judge.id,
        hackId: hack.id,
        priority: 0
      }));
    });
  });

  Promise.all(reqs).then(res => {
    for (let r of res) {
      if (!r.success) {
        throw new Error("Not successful!");
      }
    }

    console.log("Success!");
  });
}

function judgeAssignments(hacksCount: number, judgesCount: number, judgesPerHack: number): number[][] {
  let r: number[][] = repeat(() => [], judgesCount);
  let gap = hacksCount / judgesCount;
  let hacksPerJudge = Math.ceil(hacksCount * judgesPerHack / judgesCount);

  for (let judge=0;judge<judgesCount;judge++) {
    let startingHack = Math.floor(judge * gap);
    for (let i=0;i<hacksPerJudge;i++) {
      let hack = (startingHack + i) % hacksCount;
      r[judge].push(hack);
    }
  }

  return r;
}

function repeat<A>(f: () => A, c: number): Array<A> {
  let r: Array<A> = new Array(c);
  for (let i=0;i<c;i++) {
    r[i] = f();
  }
  return r;
}
