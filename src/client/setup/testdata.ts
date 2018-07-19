import {Table} from "../../protocol/database.js";
import {GenericResponse} from "../../protocol/events.js";

import {SledgeClient} from "../sledge.js";
import {importDevpostData} from "./devpost.js";

export function loadTestData(client: SledgeClient) {
  let addJudge = (name: string, email: string) => client.sendAddRow({
    table: Table.Judge,
    row: { name, email, active: 1 }
  });

  let addCategory = (name: string) => client.sendAddRow({
    table: Table.Category,
    row: { name }
  });

  (async () => {
    let responses = await Promise.all([
      addJudge("Jonny Appleseed", "jonny@apple.com"),
      addJudge("Ned Stark", "ned@example.com"),
      addJudge("Catelyn Stark", "cat@example.com"),
      addJudge("Tyrion Lannister", "tyrion@lannister.net"),
      addJudge("Homer Simpson", "homer@homer.home"),

      addCategory("Excellence"),
      addCategory("Awesomeness"),
      addCategory("Friendliness"),
      addCategory("Deliciousness")
    ]);

    for (let res of responses) {
      if (!res.success) {
        console.warn("Couldn't add judges and categories!");
        console.warn(res);
        throw new Error();
      }
    }

    let devpostCsv = await fetch("https://s3.amazonaws.com/sledge-site/testdevpost.csv");
    importDevpostData(client, devpostCsv);
  })();
}

function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.onerror = reject;
    xhr.onload = () => resolve(xhr.responseText);
    xhr.open("GET", url);
    xhr.send();
  });
}
