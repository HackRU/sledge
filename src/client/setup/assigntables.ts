import {SledgeClient} from "../SledgeClient";
import {Table, Hack, Judge, Row} from "../../protocol/database";

export function autoAssignTables(client: SledgeClient, hacks: Array<Row<Hack>>) {
  // First, get all active hacks, sorted by ID
  let activeHacks = hacks.filter(h => h.active).sort((h1,h2) => h1.id-h2.id);
  // Then start assignments
  let changeLocRequests = [];
  let nextLocation = 1;
  for (let h of activeHacks) {
    changeLocRequests.push(client.sendModifyRow({
      table: Table.Hack,
      id: h.id,
      diff: {
        location: nextLocation++
      }
    }));
  }

  // Ensure everything happened successfully
  Promise.all(changeLocRequests).then(res => {
    for (let r of res) {
      if (!r.success) {
        console.warn("Auto Assign Tables failed! Unsuccessful Response.");
        console.log(r);
        throw new Error();
      }
    }

    console.log("Successfully auto assigned tables!");
  });
}
