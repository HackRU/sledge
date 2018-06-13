// Each interface corresponds to a table stored by the server. With the
// exception of the column id, all members should correspond to columns in the
// given table. The type Row<TableName> is a complete representation of a table
// row.

/**
 * A hack to be judged, usually imported form devpost.
 */
export interface Hack {
  /** Name of Hack */
  name : string;
  /** Detailed description of hack */
  description : string;
  /** Location of hack. Used for allocation, and for finding where hacks are. */
  location : number;
  /** Hacks not active will be ignored for most things */
  active : number;
}

/**
 * A judge who will rate hacks. Usually added by an admin.
 */
export interface Judge {
  /** Name of Judge */
  name : string;
  /** Email of judge */
  email : string;
  /** Judges not active will not be allocated for judging */
  active : number;
}

/**
 * Tokens are used to authenticate clients to certain priviliges.
 */
export interface Token {
  /** A unique secret the client must provide */
  secret : string;
  /** The privilege number (see protocol/events.ts) */
  privilege : number;
}

/**
 * Determines which judges will rate which hacks.
 */
export interface JudgeHack {
  /** The judge which will be rating */
  judgeId : number;
  /** The hack which the judge will rate */
  hackId : number;
  /** The order the judge will rate the hacks in. A judge will rate a lower
      priority hack first */
  priority : number;
}

/**
 * A Superlative which is a category each judge rates.
 */
export interface Superlative {
  /** Name of superlative */
  name : string;
}

/**
 * Determines which hacks correspond with which superlatives.
 */
export interface SuperlativeHack {
  /** Hack which is eligible for a superlative */
  hackId : number;
  /** Superlative */
  superlativeId : number;
}

/**
 * A judge's placement for first and second place of a superlative.
 */
export interface SuperlativePlacement {
  /** Judge which is choosing */
  judgeId : number;
  /** Superlative which is being ranked */
  superlativeId : number;
  /** First place for superlative. A 0 indicates none is chosen. */
  firstChoiceId : number;
  /** Second place for superlative. A 0 indicates non is chosen. */
  secondChoiceId : number;
}

/**
 * Keeps track of which hacks have been marked no show by which judges
 */
export interface HackNoshow {
  /** Judge marking hack */
  judgeId : number;
  /** Hack being marked */
  hackId : number;
}

/**
 * A Category which the overall rating is based.
 */
export interface Category {
  /** Name of Category */
  name : string;
}

/**
 * A rating for a particular category.
 */
export interface Rating {
  /** Judge doing the rating */
  judgeId : number;
  /** Hack being rated */
  hackId : number;
  /** Category beign rated */
  categoryId : number;
  /** Rating from 1 to 5 */
  rating : number;
}

export type Row<T> = T & { id : number };

/**
 * A PartialTable<TableName> represents a locally stored version of a table,
 * mapping each id to the full row.
 */
export type PartialTable<T> = Array<Row<T> | undefined>;
