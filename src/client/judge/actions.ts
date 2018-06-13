import {
  Hack,
  Judge,
  Superlative,
  Category,
  Row
} from "../../protocol/database.js";

import {
  Synchronize as SyncEvent
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

  hacks : Array<Row<Hack>>;
  judges : Array<Row<Judge>>;
  superlatives : Array<Row<Superlative>>;
  categories : Array<Row<Category>>;
}

export function syncFromEvent(syncEvent : SyncEvent) : GA {
  return d => d({
    type: Type.Synchronize,

    ...syncEvent
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
