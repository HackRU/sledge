// This file describes the interface of how the Sledge client and server
// communicate. All communication runs atop Socket.io on the default namespace.
// If there's enough server resources, all clients will be allowed to connect.
// The server only sends events at the client's request so once initially
// connected the client will not receive any events.
//
// Events
//  Each hack has an interface here describing it. Events are split into three
//  types: requests (client to server), responses (server to client) and updates
//  (server to client). Events can only be sent in one direction and the event
//  name will match the name of the interface.
// Errors
//  All client-server events have schemas that correspond to their interface. A
//  ProtocolError event is sent back to the client if the interface does not
//  match, and may also be sent for other reasons. Unhandled event names are
//  ignored. Other errors are described in the specific events. N
// Authentication
//  All connected clients have a privilege represented by an integer. A
//  privilege of -1 is unprivileged, of 0 is admin and of a positive integer is
//  that the privilege of the judge with that id. On connection each client is
//  given a privilege of -1. An admin is privileged to perform administrative
//  actions and act as any judge.
// Synchronized Data
//  Hacks, judges and superlatives are considered synchronized data. This means
//  this information, stored in the server's database, is unprivileged (ie.
//  anyone should be allowed to access it) and clients that are judging need to
//  have an up-to-date copy.
// Requests and Responses
//  Each request (except those met by ProtocolError) will send back a single
//  corresponding response. Each request and response will have a returnId,
//  chosen by the client, which will be equal when they correspond.

// TODO: If a schema is null the server will ignore it, possibly causing it to
//       accept bad data and crash.

type Schema = any;

////////////////////
// Requests

export interface Request {
  returnId : string;
}

/**
 * Add a hack. Must be sent by an admin. A GenericResponse is sent back.
 */
export interface AddHack extends Request {
  name : string;
  description : string;
  location : number;
}

export const addHack : Schema = null;

/**
 * Add a judge. Must be sent by an admin. A GenericResponse is sent back.
 */
export interface AddJudge extends Request {
  name : string;
  email : string;
}

export const addJudge : Schema = null;

/**
 * Add a superlative. Must be sent by an admin. A GenericResponse is sent back.
 */
export interface AddSuperlative extends Request {
  name : string;
}

export const addSuperlative : Schema = null;

/**
 * Ask the server to change a client's privilege to the one corresponding to the
 * secret. An empty string always specifies unprivileged. An
 * AuthenticateResponse is sent back.
 */
export interface Authenticate extends Request {
  secret : string
}

export const authenticate : Schema = null;

/**
 * Ask the server to generate a secret that can be used with Authenticate which
 * will give the privilege of a specified judge. This requires a correct
 * loginCode. A LoginResponse is sent back.
 */
export interface Login extends Request {
  judgeId : number,
  loginCode : string
}

export const login : Schema = null;

/**
 * Ask the server to rate a hack for each category from a certain judge. Client
 * must be privileged as the judge or an admin. A GenericResponse is sent back.
 */
export interface RateHack extends Request {
  judgeId : number;
  hackId : number;
  ratings : number[];
}

export const rateHack : Schema = null;

/**
 * Ask the server to rank the first and second place of a superlative for a
 * given judge. Client must be privileged as the judge or an admin. A
 * GenericResponse is sent back.
 */
export interface RankSuperlative extends Request {
  judgeId : number;
  superlativeId : number;
  firstHackId : number;
  secondHackId : number;
}

export const rankSuperlative : Schema = null;

/**
 * Asks the server to start or stop synchronizing data with the client. If sync
 * is true, a Synchronize update is sent to the client, and then sent again any
 * time the relevant data changes. If false, the server will stop sending
 * Synchronize updates. A GenericResponse is sent back, and will always be sent
 * back before any updates.
 */
export interface SetSynchronize extends Request {
  sync : boolean;
};

export const setSynchronize : Schema = null;

////////////////////
// Responses

export interface Response {
  /** This isn't optional when sent, but there are points in the program where
      this won't be filled out */
  returnId? : string;
}

/**
 * Indicates if the authentication was successful and, if so, what the new
 * privilege is. The message member is a human-readable description of why the
 * request failed or how it succeeded (usually just "success" on success). If
 * successful, the privilege member is the client's new privilege, otherwise it
 * should be ignored.
 */
export interface AuthenticateResponse extends Response {
  success : boolean;
  message : string;
  privilege : number;
}

/**
 * A generic response used for requests that either fail or succeed. The message
 * member is a human-readable description of what why the request failed, or how
 * it succeeded (usually just "success" on success).
 */
export interface GenericResponse extends Response {
  success : boolean;
  message : string;
}

/**
 * Indicates if the Login was successful and what the secret for logging in as
 * that judge is. The message member is a human-readable description of what
 * happened. If successful, judgeId will match the judgeId of the request and
 * secret will be a secret which can be used in Authenticate to be privileged as
 * that judge. If unsuccessful, judgeId and secret should be ignored.
 */
export interface LoginResponse extends Response {
  success : boolean;
  message : string;
  judgeId : number;
  secret : string;
}

////////////////////
// Updates

/**
 * A ProtocolError is sent back when the client sends a malformed event. The
 * client usually assumes it will never receive a ProtocolError and it is only
 * meant for use in debugging.
 */
export interface ProtocolError {
  eventName : string;
  message : string;

  /** Optionally, the server may send back the entirety of the original event.
      This should probably be disabled in prod though. */
  original? : any;
}

export interface Synchronize {
}
