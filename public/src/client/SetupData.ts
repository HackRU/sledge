import { setSetupData } from "./ClientStorage";

export interface SetupData {
  submissions: Array<{
    name: string,
    url: string,
    location: number,
    track: number,
    prizes: Array<number>
  }>;
  categories: Array<{
    name: string,
    track: number
  }>;
  prizes: Array<{name: string}>;
  judges: Array<{name: string}>;
  tracks: Array<{name: string}>;
};

export function getDefaultSetupData(): SetupData {
  return {
    submissions: [],
    categories: [],
    prizes: [],
    judges: [],
    tracks: []
  };
}

export function copySetupData(data: SetupData): SetupData {
  return {
    submissions: data.submissions.map(sub => ({
      ...sub,
      prizes: sub.prizes.slice()
    })),
    categories: data.categories.map(cat => ({...cat})),
    prizes: data.prizes.map(prz => ({...prz})),
    judges: data.judges.map(jdg => ({...jdg})),
    tracks: data.tracks.map(trk => ({...trk}))
  };
}

export function serializeSetupData(setupData: SetupData): string {
  return JSON.stringify(setupData);
}

export function deserializeSetupData(serialized: string): SetupData {
  if (serialized) {
    return {
      ...getDefaultSetupData(),
      ...JSON.parse(serialized)
    };
  } else {
    return getDefaultSetupData();
  }
}

export function removeSubmission(submissionIndex: number, setupData: SetupData): SetupData {
  return {
    ...setupData,
    submissions: setupData.submissions.filter((_s, i) => i !== submissionIndex)
  };
}

export function addPrize(name: string, data: SetupData): SetupData {
  return {
    ...data,
    prizes: data.prizes.concat([{name}])
  };
}

export function renamePrize(idx: number, newName: string, data: SetupData): SetupData {
  return {
    ...data,
    prizes: data.prizes.map((p,i) =>
      i === idx ? {name: newName} : p
    )
  };
}

export function assignPrizeToAll(idx: number, data: SetupData): SetupData {
  return {
    ...data,
    submissions: data.submissions.map(sub => ({
      ...sub,
      prizes: sub.prizes.indexOf(idx) < 0 ?
        sub.prizes.concat([idx]) : sub.prizes
    }))
  };
}

export function addCategory(name: string, data: SetupData): SetupData {
  return {
    ...data,
    categories: data.categories.concat([{
      name,
      track: 0
    }]),
    tracks: data.tracks.length > 0 ? data.tracks : [{
      name: "Default Track"
    }]
  };
}

export function expandCategory(idx: number, data: SetupData): SetupData {
  let newCategories: Array<{name: string, track: number}> = [];
  for (let i=0;i<data.categories.length;i++) {
    if (i === idx) {
      for (let track=0;track<data.tracks.length;track++) {
        newCategories.push({
          name: data.categories[idx].name,
          track
        });
      }
    } else {
      newCategories.push(data.categories[i]);
    }
  }

  return {
    ...data,
    categories: newCategories
  };
}

export function cycleTrackOnCategory(idx: number, data: SetupData): SetupData {
  return {
    ...data,
    categories: data.categories.map((cat, i) => ({
      ...cat,
      track: idx === i ? (cat.track + 1) % data.tracks.length : cat.track
    }))
  };
}

export function getSubmissionPrizes(data: SetupData):
  Array<{submission: number, prize: number}>
{
  let result: Array<{submission: number, prize: number}> = [];
  for (let i=0;i<data.submissions.length;i++) {
    for (let prize of data.submissions[i].prizes) {
      result.push({
        submission: i,
        prize
      });
    }
  }

  return result;
}
