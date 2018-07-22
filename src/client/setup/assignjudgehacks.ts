import {SledgeClient} from "../sledge.js";
import {SynchronizeGlobal, GenericResponse} from "../../protocol/events.js";

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
