import {parse} from "papaparse";

import {SledgeClient} from "../sledge.js";

export function importDevpostData(client: SledgeClient, csvContent: string) {
  let extracted = extractDevpostData(csvContent);
  if (!extracted) {
    throw new Error("Extracion gave null");
  }

  console.log("Printing extracted data from devpost");
  console.log(extracted);

  // First, Add all hacks and superlatives
  let superlativesAddResults = extracted.superlatives.map(s => client.sendAddSuperlative({
    superlative: { name: s }
  }));
  let hacksAddResults = extracted.hacks.map(h => client.sendAddHack({
    hack: {
      name: h.name,
      description: h.description,
      location: 0,
      active: 1
    }
  }));

  // Wait until both are complete before associating hacks with superlatives
  return Promise.all([
    Promise.all(superlativesAddResults),
    Promise.all(hacksAddResults)
  ]).then(([supResults, hackResults]) => {
    // Ensure everything happened successfully
    for (let r of supResults.concat(hackResults)) {
      if (!r.success) {
        console.warn("Aborting import devpost: At least one request failed");
        console.log(r);
        throw new Error();
      }
    }

    // Now, associate all hacks with their superlatives
    let superHackResults = [];
    for (let hackIdx in extracted.hacks) {
      for (let supIdx of extracted.hacks[hackIdx].superlatives) {
        superHackResults.push(client.sendAddSuperlativeHack({
          superlativeHack: {
            hackId: hackResults[hackIdx].newRowId,
            superlativeId: supResults[supIdx].newRowId
          }
        }));
      }
    }

    return Promise.all(superHackResults);
  }).then(supHackResults => {
    // Make sure everything happened successfully
    for (let r of supHackResults) {
      if (!r.success) {
        console.warn("Aborting import devpost: At least one request failed");
        console.log(r);
        throw new Error();
      }
    }

    console.log("Import successful!");
  });
}

export function extractDevpostData(csvContent: string): DevpostData | undefined {
  // First, parse the data
  let parsed = parse(csvContent);

  // Then, check for errors
  if (parsed.errors.length > 0 || parsed.data.length < 1) {
    console.warn("Aborting import devpost: CSV Errors");
    console.log(parse);
    return undefined;
  }

  // First row is the column headers. Create a map of headers to index.
  let columnIds = new Map<string, number>();
  for (let i=0;i<parsed.data[0].length;i++) {
    let col = parsed.data[0][i];
    if (columnIds.has(col)) {
      console.warn("WARNING: CSV Data has repeat column: "+col+". Using first.");
    } else {
      columnIds.set(parsed.data[0][i], i);
    }
  }

  // Ensure the columns we care about exist
  let nameColId:number, desColId:number, supsColId:number;
  if (
    ((nameColId = columnIds.get("Submission Title")) == null) ||
    ((desColId = columnIds.get("Plain Description")) == null) ||
    ((supsColId = columnIds.get("Desired Prizes")) == null)
  ) {
    console.warn("Aborting import devpost: missing column");
    return undefined;
  }

  // Extract data from every row
  let extractedRows: Array<{
    name: string,
    description: string,
    superlatives: string[]
  } | undefined> = parsed.data.slice(1).map(row => {
    let name = row[nameColId] as string;
    let des = row[desColId] as string;
    let sups = row[supsColId];
    if ( name == null || des == null || sups == null ) {
      console.warn("WARNING: Skipping row because column is missing");
      console.log(row);
      return undefined;
    }
    let parsedSups = parse(sups, {delimiter: ","});
    if (parsedSups.errors.length > 0 || parsedSups.data.length > 1) {
      console.warn("WARNING: Skipping row because poorly formatted superlatives");
      console.log(row);
      return undefined;
    }
    return {
      name,
      description: des,
      superlatives: parsedSups.data.length === 1 ?
        parsedSups.data[0].map((s:string) => s.trim()) : []
    };
  }).filter(r => !!r);

  // Now we create a list of all superlatives
  let supsSet = new Set<string>();
  for (let r of extractedRows) {
    for (let s of r.superlatives) {
      supsSet.add(s);
    }
  }
  let superlatives = Array.from(supsSet).filter(s => !!s);

  return {
    superlatives,
    hacks: extractedRows.map(r => ({
      name: r.name,
      description: r.description,
      superlatives: r.superlatives
        .map(s => superlatives.indexOf(s))
        .filter(i => i>=0)
    }))
  };
}

export interface DevpostData {
  superlatives: string[];
  hacks: Array<{
    name: string;
    description: string;
    /* Indexes into superlatives */
    superlatives: number[];
  }>
}
