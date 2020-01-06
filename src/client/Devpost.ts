import {parse} from "papaparse";

import {SetupData, copySetupData} from "./SetupData";

/**
 * Parses an exported CSV from the export functionality in devpost. This
 * function should work whether or not the option to include personably
 * identifiable information is checked.
 */
export function parseDevpostData(csvContent: string): DevpostData | DevpostParseError {
  let csv = parse(csvContent, {delimiter: ","});
  if (csv.errors.length > 0 || csv.data.length < 1) {
    return {error: "Unable to parse csv", csv};
  }

  // To make the parser more resilient, we match on column headers instead of
  // just column positions
  let columnIds = new Map<string, number>();
  for (let i=0;i<csv.data[0].length;i++) {
    let col = csv.data[0][i];
    if (columnIds.has(col)) {
      return {error: "Repeat column titles", csv};
    }
    columnIds.set(col, i);
  }
  let nameCol = columnIds.get("Submission Title");
  if (nameCol == null) return {error: "Missing name column", csv};
  let prizesCol = columnIds.get("Desired Prizes");
  if (prizesCol == null) return {error: "Missing prizes column", csv};
  let tableCol = columnIds.get("Table Number");
  if (tableCol == null) return {error: "Missing table column", csv};
  let maxCols = Math.max(nameCol, prizesCol, tableCol);

  // Now we go through each row and extract submissions and prizes
  let submissions = [];
  let prizes = [];
  for (let i=1;i<csv.data.length;i++) {
    let row = csv.data[i];

    // Ignore blank lines which show up as rows with one empty entry
    if (row.length === 1 && row[0] === "") continue;

    // Ensure proper number of columns
    if (row.length <= maxCols) {
      return {error: "Improper number of columns", csv, row};
    }

    let name = row[nameCol];
    let table = parseInt(row[tableCol]);
    if (Number.isNaN(table)) {
      return {error: "Can't parse table number", csv, row};
    }

    // Extract Prizes
    let hackPrizes = parse(row[prizesCol], {delimiter: ","});
    let prizeIdxs = [];
    if (hackPrizes.errors.length > 0 || hackPrizes.data.length > 1) {
      return {error: "Can't parse prizes", csv, hackPrizes};
    }
    if (hackPrizes.data.length === 1) {
      for (let j=0;j<hackPrizes.data[0].length;j++) {
        // To help with possible ambiguities in the parsing, we trim the name
        let prize = hackPrizes.data[0][j].trim();
        let prizeIdx = prizes.indexOf(prize);
        if (prizeIdx < 0) prizeIdx = prizes.push(prize) - 1;
        prizeIdxs.push(prizeIdx);
      }
    }

    submissions.push({
      name, table, prizes: prizeIdxs
    });
  }

  // Sort submissions by table number
  submissions = submissions.sort((x,y) => {
    return x.table - y.table;
  });

  return { submissions, prizes, error: null };
}

/**
 * Merge devpost data into setup data and return the new data. Prizes and submissions are matched
 * by name
 */
export function mergeDevpostToSetupData(devpost: DevpostData, setup: SetupData): SetupData {
  let data: SetupData = copySetupData(setup);

  // If there are any submissions, we need at least one track to assign them. Try the first track,
  // and if one doesn't exist create it.
  const defaultTrack = 0;
  if (devpost.submissions.length > 0 && data.tracks.length <= defaultTrack) {
    data.tracks.push({name: "Default Track"});
  }

  let prizeIndexes: Array<number> = [];
  for (let i=0;i<devpost.prizes.length;i++) {
    let idx = data.prizes.findIndex(p => devpost.prizes[i] === p.name);
    if (idx < 0) {
      idx = data.prizes.push({name: devpost.prizes[i]})-1;
    }
    prizeIndexes[i] = idx;
  }

  for (let submission of devpost.submissions) {
    let obj = data.submissions.find(sub => sub.name === submission.name);
    if (obj) {
      obj.location = submission.table;
      for (let prizeOldIndex of submission.prizes) {
        let prizeIdx = prizeIndexes[prizeOldIndex];
        if (obj.prizes.indexOf(prizeIdx) < 0) {
          obj.prizes.push(prizeIdx);
        }
      }
    } else {
      data.submissions.push({
        name: submission.name,
        location: submission.table,
        prizes: submission.prizes.map(p => prizeIndexes[p]),
        track: defaultTrack
      });
    }
  }

  return data;
}

export interface DevpostData {
  error: null;
  prizes: Array<string>;
  submissions: Array<{
    name: string,
    table: number,
    prizes: Array<number>
  }>;
};

export interface DevpostParseError {
  error: string;
  csv: any;
  row?: any;
  hackPrizes?: any;
};

export const TEST_CSV_URL = "https://s3.amazonaws.com/sledge-assets/hackru-sp2019.csv";
