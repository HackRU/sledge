import {
  Hack,
  Judge,
  JudgeHack,
  Superlative,
  SuperlativeHack,
  Category,
  Row
} from "./database.js";

// This file describes the protocol of how the Sledge client and server
// communicate. All communication runs atop Socket.io on the default namespace.
// If there's enough server resources, all clients will be allowed to connect.
// The server only sends events at the client's request so once initially
// connected the client will not receive any events.
//
// Events
//  Each event has a unique name and goes in a single direction.Events are split
//  into three types: requests (client to server), responses (server to client)
//  and updates (server to client). For each event, this file includes a written
//  description, an interface, and a meta object.
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
//  Certain tables in the database are considered shared and can be given to any
//  client that requests it regardless of their privilege. All judges should
//  have a copy of this data and keep their copy synchronized with the server.
//  The following tables are considered shared:
//    Hacks, Judges, Superlatives, SuperlativeHacks, Categories
// Requests and Responses
//  Each request (except those met by ProtocolError) will send back a single
//  corresponding response. Each request and response will have a returnId,
//  chosen by the client, which will be equal when they correspond.
// Reconnection
//  By default, the socket.io client will automatically attempt to reconnect to
//  the server if a connection is lost, and resend any lost events.
//  Unfortunately, socket.io does not (always) keep track of clients after
//  they're disconnected so to the server it appears like a new client. This is
//  problematic if these resent events require the client to be privileged.
//  Therefore, on reconnect the client should ensure socket.io reconnects with
//  proper query parameters.
// Query Parameters
//  If the "secret" query parameter is present the server will, immediately upon
//  connection, attempt to authenticate the client as though the server was sent
//  an Authenticate request. The server will not send back a response and will
//  disconnect the client if there's an issue authenticating.
//  If the "synchronize" query parameter is present and set to a nonempty value
//  the server will act as though it was sent a SetSynchronize event with
//  sync=true and will send Synchronize updates to the client. Unlike the
//  request, the server will not send back a response and will disconnect if
//  this can't be done successfully.

export interface EventMeta {
  name : string;
  /* If not defined, any value is accepted */
  schema? : Schema;
}

/**
 * Object representing a JSON schema.
 */
type Schema = object;

//TODO: Schemas for each event

////////////////////
// Requests

export interface RequestMeta extends EventMeta {
  response: string;
}

export interface Request {
  returnId?: string;
}

/**
 * Add a category. Must be sent by an admin.
 */
export interface AddCategory extends Request {
  category: Category;
}

export const addCategory: RequestMeta = {
  name: "AddCategory",
  response: "AddRowResponse"
};

/**
 * Add a hack. Must be sent by an admin.
 */
export interface AddHack extends Request {
  hack: Hack;
}

export const addHack : RequestMeta = {
  name: "AddHack",
  response: "AddRowResponse"
};

/**
 * Add a judge. Must be sent by an admin.
 */
export interface AddJudge extends Request {
  judge : Judge;
}

export const addJudge : RequestMeta = {
  name: "AddJudge",
  response: "AddRowResponse"
};

/**
 * Add an association between a judge and a hack. Must be an admin.
 */
export interface AddJudgeHack extends Request {
  judgeHack: JudgeHack;
}

export const addJudgeHack: RequestMeta = {
  name: "AddJudgeHack",
  response: "AddRowResponse"
};

/**
 * Add a superlative. Must be sent by an admin.
 */
export interface AddSuperlative extends Request {
  superlative : Superlative;
}

export const addSuperlative : RequestMeta = {
  name: "AddSuperlative",
  response: "AddRowResponse"
};

/**
 * Add an association between a superlative and a hack. Must be an admin.
 */
export interface AddSuperlativeHack extends Request {
  superlativeHack: SuperlativeHack;
}

export const addSuperlativeHack: RequestMeta = {
  name: "AddSuperlativeHack",
  response: "AddRowResponse"
};

/**
 * Ask the server to change a client's privilege to the one corresponding to the
 * secret. An empty string always specifies unprivileged. An
 * AuthenticateResponse is sent back.
 */
export interface Authenticate extends Request {
  secret: string;
}

export const authenticate : RequestMeta = {
  name: "Authenticate",
  response: "AuthenticateResponse"
}

/**
 * Ask the server to generate a secret that can be used with Authenticate which
 * will give the privilege of a specified judge. This requires a correct
 * loginCode. A LoginResponse is sent back.
 */
export interface Login extends Request {
  judgeId: number,
  loginCode: string
}

export const login : RequestMeta = {
  name: "Login",
  response: "LoginResponse"
}

/**
 * Ask the server to rate a hack for each category from a certain judge. Client
 * must be privileged as the judge or an admin. A GenericResponse is sent back.
 */
export interface RateHack extends Request {
  judgeId: number;
  hackId: number;
  ratings: number[];
}

export const rateHack : RequestMeta = {
  name: "RateHack",
  response: "GenericResponse"
}

/**
 * Ask the server to rank the first and second place of a superlative for a
 * given judge. Client must be privileged as the judge or an admin. A
 * GenericResponse is sent back.
 */
export interface RankSuperlative extends Request {
  judgeId: number;
  superlativeId: number;
  firstHackId: number;
  secondHackId: number;
}

export const rankSuperlative : RequestMeta = {
  name: "RankSuperlative",
  response: "GenericResponse"
}

/**
 * Asks the server to start or stop synchronizing data with the client. If sync
 * is true, a Synchronize update is sent to the client, and then sent again any
 * time the relevant data changes. If false, the server will stop sending
 * Synchronize updates. A GenericResponse is sent back, and will always be sent
 * back before any updates.
 */
export interface SetSynchronize extends Request {
  sync: boolean;
}

export const setSynchronize : RequestMeta = {
  name: "SetSynchronize",
  response: "GenericResponse"
}

////////////////////
// Responses

export type ResponseMeta = EventMeta;

export interface Response {
  /** This isn't optional when sent, but there are points in the program where
      this won't be filled out */
  returnId?: string;

  /** Indicates if the request was successful */
  success: boolean;
  /**
   * A human-readable description of why the request failed or how it succeeded
   * (usually just "success" on success).
   */
  message: string;
}

/**
 * Indicates the result of adding a row and, if so, what the id of the newly
 * created row is. If successful, newRowId will be the id of the new row,
 * otherwise it should be ignored.
 */
export interface AddRowResponse extends Response {
  newRowId: number;
}

export const addRowResponse: ResponseMeta = {
  name: "AddRowResponse"
}

/**
 * Indicates if the authentication was successful and, if so, what the new
 * privilege is. The message member is a human-readable description of why the
 * request failed or how it succeeded (usually just "success" on success). If
 * successful, the privilege member is the client's new privilege, otherwise it
 * should be ignored.
 */
export interface AuthenticateResponse extends Response {
  privilege: number;
}

export const authenticateResponse : ResponseMeta = {
  name: "AuthenticateResponse"
}

/**
 * A generic response used for requests that either fail or succeed.
 */
export interface GenericResponse extends Response {
}

export const genericResponse : ResponseMeta = {
  name: "GenericResponse"
}

/**
 * Indicates if the Login was successful and what the secret for logging in as
 * that judge is. The message member is a human-readable description of what
 * happened. If successful, judgeId will match the judgeId of the request and
 * secret will be a secret which can be used in Authenticate to be privileged as
 * that judge. If unsuccessful, judgeId and secret should be ignored.
 */
export interface LoginResponse extends Response {
  judgeId: number;
  secret: string;
}

export const loginResponse : ResponseMeta = {
  name: "LoginResponse"
}

////////////////////
// Updates

export type UpdateMeta = EventMeta;

/**
 * A ProtocolError is sent back when the client sends a malformed event. The
 * client usually assumes it will never receive a ProtocolError and it is only
 * meant for use in debugging.
 */
export interface ProtocolError {
  eventName: string;
  message: string;

  /** Optionally, the server may send back the entirety of the original event.
      This should probably be disabled in prod though. */
  original? : any;
}

export const protocolError : UpdateMeta = {
  name: "ProtocolError"
}

/**
 * A Synchronize sends the current state of synchronized data to the client
 */
export interface Synchronize {
  hacks: Array<Row<Hack>>;
  judges: Array<Row<Judge>>;
  superlatives: Array<Row<Superlative>>;
  superlativeHacks: Array<Row<SuperlativeHack>>;
  categories: Array<Row<Category>>;
}

export const synchronize : UpdateMeta = {
  name: "Synchronize"
}
