import {
  Hack,
  Judge,
  Superlative,
  Category,
  Row
} from "../../protocol/database.js";

import {
  SynchronizeShared as SyncEvent
} from "../../protocol/events.js";

export type Action = Synchronize | OpenHackRelative;

export enum Type {
  OpenList,

  Synchronize,
  OpenHackRelative,
}

/* Generic Action, could be sync or async */
type GA = (d:(a:Action) => void) => void;

////////////////////
// Singular Actions (no data)

export const openList : GA = d => ({
  type: Type.OpenList
})

////////////////////
// Synchronize Actions

export interface Synchronize {
  type : Type.Synchronize;

  update: SyncEvent
}

export function syncFromEvent(syncEvent : SyncEvent) : GA {
  return d => d({
    type: Type.Synchronize,

    update: syncEvent
  });
}

////////////////////
// OpenHackRelative actions

export interface OpenHackRelative {
  type : Type.OpenHackRelative

  offset : number;
}

export const nextHack : GA = d => ({
  type: Type.OpenHackRelative,

  offset: 1
})

export const prevHack : GA = d => ({
  type: Type.OpenHackRelative,

  offset: -1
})
