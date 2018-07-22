import {
  Table,
  Hack,
  Judge,
  JudgeHack,
  Superlative,
  SuperlativeHack,
  Category,
  Token,
  Row
} from "./database.js";

// This file describes the protocol of how the Sledge client and server
// communicate. All communication runs atop Socket.io on the default namespace.
// If there's enough server resources, all clients will be allowed to connect.
// The server only sends events at the client's request so once initially
// connected the client will not receive any events.
//
// Events
//  Each event has a unique name and goes in a single direction. Events are split
//  into three types: requests (client to server), responses (server to client)
//  and updates (server to client). For each event, this file includes a written
//  description, an interface, and a meta object.
// Errors
//  All client-server events have schemas that correspond to their interface. A
//  ProtocolError event is sent back to the client if the interface does not
//  match, and may also be sent for other reasons. Unhandled event names are
//  ignored. Other errors are described in the specific events.
// Authentication
//  All connected clients have a privilege represented by an integer. A
//  privilege of -1 is unprivileged, of 0 is admin and of a positive integer is
//  that the privilege of the judge with that id. On connection each client is
//  given a privilege of -1. An admin is privileged to perform administrative
//  actions and act as any judge.
// Synchronized Data
//  Because Sledge is a real-time judging system, we need ways to push events to
//  judges without them having to request it each time the data changes. Clients
//  can request to synchronize to certain types of updates which will cause them
//  to to receive a type of synchronize event depending on what changes and what
//  they are synchronized to.
// Requests and Responses
//  Each request (except those met by ProtocolError) will send back a single
//  corresponding response. Each request and response will have a returnId,
//  chosen by the client, which will be equal when they correspond.
// Reconnectio
//  By default the socket.io client will automatically attempt to reconnect to
//  the server if a connection is lost, and resend any lost events.
//  Unfortunately, socket.io does not (always) keep track of clients after
//  they're disconnected so to the server it appears like a new client. This is
//  problematic if these resent events require the client to be privileged.
//  Therefore, on reconnect the client should ensure socket.io reconnects with
//  proper query parameters. It is up to the client to resynchronize.
// Query Parameters
//  If the "secret" query parameter is present the server will, immediately upon
//  connection, attempt to authenticate the client as though the server was sent
//  an Authenticate request. The server will not send back a response and will
//  disconnect the client if there's an issue with authenticating.

export interface EventMeta {
  name : string;
  eventType: EventType;
  /* If not defined, any value is accepted */
  schema? : Schema;
}

export const enum EventType {
  Request = "EVENT_TYPE_REQUEST",
  Response = "EVENT_TYPE_RESPONSE",
  Update = "EVENT_TYPE_UPDATE"
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
 * Add a row to the table. Must be sent by an admin;
 */
export type AddRow = (
    {table: Table.Category, row: Category} |
    {table: Table.Hack, row: Hack} |
    {table: Table.Judge, row: Judge} |
    {table: Table.JudgeHack, row: JudgeHack} |
    {table: Table.Superlative, row: Superlative} |
    {table: Table.SuperlativeHack, row: SuperlativeHack} |
    {table: Table.Token, row: Token}
  ) & Request;

export const addRow : RequestMeta = {
  name: "AddRow",
  eventType: EventType.Request,
  response: "AddRowResponse"
}

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
  eventType: EventType.Request,
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
  eventType: EventType.Request,
  response: "LoginResponse"
}

/**
 * Modify a row given its ID. Must be sent by an admin.
 */
export type ModifyRow = (
    {table: Table.Hack, id: number, diff: Partial<Hack>}
  ) & Request;

export const modifyRow: RequestMeta = {
  name: "ModifyRow",
  eventType: EventType.Request,
  response: "GenericResponse"
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
  eventType: EventType.Request,
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
  eventType: EventType.Request,
  response: "GenericResponse"
}

/**
 * Set the priority of a hack. Must be sent by an admin.
 */
export interface SetJudgeHackPriority extends Request {
  judgeId: number;
  hackId: number;
  priority: number;
}

export const setJudgeHackPriority: RequestMeta = {
  name: "SetJudgeHackPriority",
  eventType: EventType.Request,
  response: "GenericResponse"
}

/**
 * Asks the server to start or stop synchronizing global data.
 */
export interface SetSynchronizeGlobal extends Request {
  syncShared: boolean;
}

export const setSynchronizeGlobal: RequestMeta = {
  name: "SetSynchronizeGlobal",
  eventType: EventType.Request,
  response: "GenericResponse"
}

/**
 * Asks the server to start or stop synchronizing data for a particular judge.
 * Client must be privileged as that particular judge.
 */
export interface SetSynchronizeJudge extends Request {
  judgeId: number;
  syncMyHacks: boolean;
}

export const setSynchronizeJudge: RequestMeta = {
  name: "SetSynchronizeJudge",
  eventType: EventType.Request,
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
 * Indicates if adding a row was successful and, if so, what the new ID is.
 */
export interface AddRowResponse extends Response {
  newRowId: number;
}

export const addRowResponse: ResponseMeta = {
  name: "AddRowResponse",
  eventType: EventType.Response
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
  name: "AuthenticateResponse",
  eventType: EventType.Response
}

/**
 * A generic response used for requests that either fail or succeed.
 */
export interface GenericResponse extends Response {
}

export const genericResponse : ResponseMeta = {
  name: "GenericResponse",
  eventType: EventType.Response
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
  name: "LoginResponse",
  eventType: EventType.Response
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
  name: "ProtocolError",
  eventType: EventType.Update
}

/**
 * Synchronizes global data.
 */
export interface SynchronizeGlobal {
  isFull: boolean;

  // An unordered list of rows

  hacks: Array<Row<Hack>>;
  judges: Array<Row<Judge>>;
  superlatives: Array<Row<Superlative>>;
  superlativeHacks: Array<Row<SuperlativeHack>>;
  categories: Array<Row<Category>>;

  // These will be undefined for non-admins, and may not be sent if update
  // is partial.

  /** judgeHackMatrix[judgeId][hackId] is priority */
  judgeHackMatrix?: number[][];
  /** superlativeHackMatrix[superlativeId][hackId] if hack wants superlative prize */
  superlativeHackMatrix?: boolean[][];
  /** noshowMatrix[judgeId][hackId] if judge marks hack as noshow */
  noshowMatrix?: boolean[][];
  /** ratings[judgeId][hackId][categoryId] */
  ratings?: number[][][];
  /** superlativePlacements[judgeId][superlativeId] */
  superlativePlacements?: Array<Array<{
    firstChoiceId: number,
    secondChoiceId: number
  }>>;
}

export const synchronizeGlobal : UpdateMeta = {
  name: "SynchronizeGlobal",
  eventType: EventType.Update
}

/**
 * Synchronizes data specific to a judge
 */
export interface SynchronizeJudge {
  judgeId: number;
  hackIds: number[];
}

export const synchronizeJudge: UpdateMeta = {
  name: "SynchronizeJudge",
  eventType: EventType.Update,
}

////////////////////
// All Hacks

export const allHacks : Array<EventMeta> = [
  addRow,
  authenticate,
  login,
  modifyRow,
  rateHack,
  rankSuperlative,
  setJudgeHackPriority,
  setSynchronizeGlobal,
  setSynchronizeJudge,

  addRowResponse,
  authenticateResponse,
  genericResponse,
  loginResponse,

  protocolError,
  synchronizeGlobal,
  synchronizeJudge
];
