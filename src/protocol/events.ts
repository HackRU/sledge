import {
  Table,
  Hack,
  Judge,
  JudgeHack,
  Superlative,
  SuperlativeHack,
  SuperlativePlacement,
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
//  All client-server events have schemas that correspond to their interface.
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
// Reconnection
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

/**
 * Object representing a JSON schema.
 */
type Schema = object;

export const enum EventClass {
  Request = "EVENT_TYPE_REQUEST",
  Response = "EVENT_TYPE_RESPONSE",
  Update = "EVENT_TYPE_UPDATE"
}

export const enum EventType {
  AddRow = "ADD_ROW",
  Authenticate = "AUTHENTICATE",
  Login = "LOGIN",
  ModifyRow = "MODIFY_ROW",
  RateHack = "RATE_HACK",
  RankSuperlative = "RANK_SUPERLATIVE",
  SetJudgeHackPriority = "SET_JUDGE_HACK_PRIORITY",
  SetSynchronizeGlobal = "SET_SYNCHRONIZE_GLOBAL",
  SetSynchronizeJudge = "SET_SYNCHRONIZE_JUDGE",

  AddRowResponse = "ADD_ROW_RESPONSE",
  AuthenticateResponse = "AUTHENTICATE_RESPONSE",
  GenericResponse = "GENERIC_RESPONSE",
  LoginResponse = "LOGIN_RESPONSE",

  ProtocolError = "PROTOCOL_ERROR",
  SynchronizeGlobal = "SYNCHRONIZE_GLOBAL",
  SynchronizeJudge = "SYNCHRONIZE_JUDGE"
}

export type EventMeta = {
    eventClass: EventClass.Request,
    eventType: EventType,
    response: EventType,
    schema: Schema
  } | {
    eventClass: EventClass.Response | EventClass.Update,
    eventType: EventType
  };

////////////////////
// Request

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

export const addRow: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.AddRow,
  response: EventType.AddRowResponse,
  schema: {
    "type": "object",
    "oneOf": [
      {
        "properties": {
          "name": {"type": "string"},
          "description": {"type": "string"},
          "location": {"type": "integer"},
          "active": {"type": "integer"}
        },
  	    "required": ["name", "description", "location", "active"]
      },
      {
        "properties": {
	        "name": {"type": "string"}
	      },
	      "required": ["name"]
      },
      {
        "properties":{
          "name":{"type" : "string"},
          "email":{"type" : "string"},
          "active":{"type" : "integer"}
        },
        "required" : ["name", "email", "active"]
      },
      {
        "properties": {
          "judgeId": {"type": "integer"},
          "hackId": {"type": "integer"},
          "priority": {"type": "integer"}
        },
	      "required": ["judgeId","hackId","priority"]
      },
      {
        "properties": {
          "name": {"type": "string"}
	      },
	      "required": ["name"]
      },
      {
        "properties": {
          "hackId": {"type": "integer"},
          "superlativeId": {"type": "integer"}
        },
	      "required": ["hackId","superlativeId"]
      },
      {
        "properties": {
          "secret": {"type": "string"},
          "privilege" :{"type": "integer", "minimum": -1}
	      },
	      "required": ["secret","privilege"]
      }
    ]
  }
}

/**
 * Ask the server to change a client's privilege to the one corresponding to the
 * secret. An empty string always specifies unprivileged. An
 * AuthenticateResponse is sent back.
 */
export interface Authenticate extends Request {
  secret: string;
}

export const authenticate: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.Authenticate,
  response: EventType.AuthenticateResponse,
  schema: {
    "type":"object",
    "properties": {
      "secret":{"type": "string"},
    },
    "required": ["secret"]
  }
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

export const login: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.Login,
  response: EventType.LoginResponse,
  schema: {}
}

/**
 * Modify a row given its ID. Must be sent by an admin.
 */
export type ModifyRow = (
    {table: Table.Hack, id: number, diff: Partial<Hack>}
  ) & Request;

export const modifyRow: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.ModifyRow,
  response: EventType.GenericResponse,
  schema: {}
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

export const rateHack: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.RateHack,
  response: EventType.GenericResponse,
  schema: {}
}

/**
 * Ask the server to rank the first and second place of a superlative for a
 * given judge. Client must be privileged as the judge or an admin. A
 * GenericResponse is sent back.
 */
export interface RankSuperlative extends Request {
  judgeId: number;
  superlativeId: number;
  firstChoiceId: number;
  secondChoiceId: number;
}

export const rankSuperlative: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.RankSuperlative,
  response: EventType.GenericResponse,
  schema: {}
}

/**
 * Set the priority of a hack. Must be sent by an admin.
 */
export interface SetJudgeHackPriority extends Request {
  judgeId: number;
  hackId: number;
  priority: number;
}

export const setJudgeHackPriority: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.SetJudgeHackPriority,
  response: EventType.GenericResponse,
  schema: {}
}

/**
 * Asks the server to start or stop synchronizing global data.
 */
export interface SetSynchronizeGlobal extends Request {
  syncShared: boolean;
}

export const setSynchronizeGlobal: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.SetSynchronizeGlobal,
  response: EventType.GenericResponse,
  schema: {}
}

/**
 * Asks the server to start or stop synchronizing data for a particular judge.
 * Client must be privileged as that particular judge.
 */
export interface SetSynchronizeJudge extends Request {
  judgeId: number;
  syncMyHacks: boolean;
}

export const setSynchronizeJudge: EventMeta = {
  eventClass: EventClass.Request,
  eventType: EventType.SetSynchronizeJudge,
  response: EventType.GenericResponse,
  schema: {}
}

////////////////////
// Responses

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

export const addRowResponse: EventMeta = {
  eventClass: EventClass.Response,
  eventType: EventType.AddRowResponse
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

export const authenticateResponse: EventMeta = {
  eventClass: EventClass.Response,
  eventType: EventType.AuthenticateResponse
}

/**
 * A generic response used for requests that either fail or succeed.
 */
export interface GenericResponse extends Response {
}

export const genericResponse: EventMeta = {
  eventClass: EventClass.Response,
  eventType: EventType.GenericResponse
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

export const loginResponse: EventMeta = {
  eventClass: EventClass.Response,
  eventType: EventType.LoginResponse
}

////////////////////
// Updates

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

export const protocolError: EventMeta = {
  eventClass: EventClass.Update,
  eventType: EventType.ProtocolError
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

  /** judgeHackMatrix[judgeId-1][hackId-1] is priority */
  judgeHackMatrix?: number[][];
  /** superlativeHackMatrix[superlativeId-1][hackId-1] if hack wants superlative prize */
  superlativeHackMatrix?: boolean[][];
  /** noshowMatrix[judgeId-1][hackId-1] if judge marks hack as noshow */
  noshowMatrix?: boolean[][];
  /** ratings[judgeId-1][hackId-1][categoryId-1] */
  ratings?: number[][][];
  /** superlativePlacements[judgeId-1][superlativeId-1] */
  superlativePlacements?: Array<Array<{
    firstChoiceId: number,
    secondChoiceId: number
  }>>;
}

export const synchronizeGlobal: EventMeta = {
  eventClass: EventClass.Update,
  eventType: EventType.SynchronizeGlobal
}

/**
 * Synchronizes data specific to a judge. The first SynchronizeJudge following a
 * SetSynhcronizeJudge will have all fields filled.
 */
export interface SynchronizeJudge {
  judgeId: number;

  // These will only be sent when things change

  hackIds?: number[];
  /** ratings[hackId-1][categoryId-1] */
  ratings?: number[][];
  /** superlativePlacements[superlativeId-1] */
  superlativePlacements?: SuperlativePlacement[];
}

export const synchronizeJudge: EventMeta = {
  eventClass: EventClass.Update,
  eventType: EventType.SynchronizeJudge
}

////////////////////
// All Hacks

export const eventMetas : Array<EventMeta> = [
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
