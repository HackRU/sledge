import io from "socket.io-client";

import {
  EventClass, EventType, EventMeta, Request, Response,

  AddRow, Authenticate, Login, ModifyRow, RateHack, RankSuperlative, SetJudgeHackPriority,
  SetSynchronizeGlobal, SetSynchronizeJudge, ProtocolError, SynchronizeGlobal, SynchronizeJudge,
  AddRowResponse, LoginResponse,

  addRow, addRowResponse, authenticate, authenticateResponse, AuthenticateResponse, eventMetas, genericResponse,
  GenericResponse, login, loginResponse, modifyRow, protocolError, rankSuperlative, rateHack, setJudgeHackPriority,
  setSynchronizeGlobal, setSynchronizeJudge, synchronizeGlobal, synchronizeJudge
} from "../protocol/events.js";
import * as db from "../protocol/database.js";

/**
 * A SledgeClient wraps the regular SocketIO client to make a sledge-specific
 * client, handling the following aspects
 *  - Event Types
 *  - Request/Response handling with promises
 *  - Autoreconnect and Autoreauthentication
 */
export class SledgeClient {
  socket: SocketIOClient.Socket;
  status: SledgeStatus = SledgeStatus.Connecting;

  private responseResolvers: Map<string, (r:any) => void>;

  private syncGlobalSubs: Array<(e:SynchronizeGlobal) => void>;
  private syncJudgeSubs: Array<(e:SynchronizeJudge) => void>;
  private protoErrSubs: Array<(e:ProtocolError) => void>;
  private statusSubs: Array<(s:SledgeStatus) => void>;

  constructor(opts : SledgeOptions) {
    this.socket = io(opts.host, { reconnection: false });
    this.responseResolvers = new Map();

    this.syncGlobalSubs = [];
    this.syncJudgeSubs = [];
    this.protoErrSubs = [];
    this.statusSubs = [];

    this.setupResolverDispatch(addRowResponse);
    this.setupResolverDispatch(authenticateResponse);
    this.setupResolverDispatch(genericResponse);
    this.setupResolverDispatch(loginResponse);

    this.socket.on("ProtocolError", (e:ProtocolError) => {
      console.warn("ProtocolError for %s\n%s", e.eventName, e.message);
      if (e.original) console.warn(e.original);
      for (let notify of this.protoErrSubs) notify(e);
    });

    this.socket.on("SynchronizeGlobal", (e: SynchronizeGlobal) => {
      this.syncGlobalSubs.forEach(n => n(e));
    });
    this.socket.on("SynchronizeJudge", (e: SynchronizeJudge) => {
      this.syncJudgeSubs.forEach(n => n(e));
    });

    this.socket.on("connect", () => {
      this.status = SledgeStatus.Connected;
      this.dispatchStatus();
    });
    this.socket.on("reconnecting", () => {
      this.status = SledgeStatus.Reconnecting;
      this.dispatchStatus();
    });
    this.socket.on("disconnect", () => {
      this.status = SledgeStatus.Disconnected;
      this.dispatchStatus();
    });
  }

  private dispatchStatus() {
    for (let notify of this.statusSubs) notify(this.status);
  }

  private setupResolverDispatch(meta : EventMeta) {
    this.socket.on(meta.eventType, (data:Response) => {
      let resolver = this.responseResolvers.get(data.returnId);
      if (resolver) {
        resolver(data);
        this.responseResolvers.delete(data.returnId);
      } else {
        throw new Error("Got response with unknown returnId: " + data.returnId);
      }
    });
  }

  private sendAndAwait(eventName : string, data : Request) : Promise<any> {
    let returnId = this.generateUniqueReturnId();
    this.socket.emit(eventName, {...data, returnId});
    return new Promise( (resolve, reject) => {
      this.responseResolvers.set(returnId, resolve);
    });
  }

  private generateUniqueReturnId() {
    return Date.now().toString(16).slice(-6) + Math.random().toString(16).slice(-6);
  }

  private genSender<
    Req extends Request,
    Res extends Response
  >(evt: EventMeta): (this: SledgeClient, r: Req) => Promise<Res> {
    return function (req) {
      return this.sendAndAwait(evt.eventType, req);
    }
  }

  ////////////////////
  // Requests

  sendAddRow = this.genSender<
    AddRow, AddRowResponse>(addRow);
  sendAuthenticate = this.genSender<
    Authenticate, AuthenticateResponse>(authenticate);
  sendLogin = this.genSender<
    Login, LoginResponse>(login);
  sendModifyRow = this.genSender<
    ModifyRow, GenericResponse>(modifyRow);
  sendRateHack = this.genSender<
    RateHack, GenericResponse>(rateHack);
  sendRankSuperlative = this.genSender<
    RankSuperlative, GenericResponse>(rankSuperlative);
  sendSetJudgeHackPriority = this.genSender<
    SetJudgeHackPriority, GenericResponse>(setJudgeHackPriority);
  sendSetSynchronizeGlobal = this.genSender<
    SetSynchronizeGlobal, GenericResponse>(setSynchronizeGlobal);
  sendSetSynchronizeJudge = this.genSender<
    SetSynchronizeJudge, GenericResponse>(setSynchronizeJudge);

  ////////////////////
  // Updates

  subscribeStatus(notify: (s:SledgeStatus) => void): () => void {
    this.statusSubs.push(notify);
    return () => {
      this.statusSubs = this.statusSubs.filter(n => n!==notify);
    };
  }

  subscribeSyncGlobal(notify: (e:SynchronizeGlobal) => void): () => void {
    this.syncGlobalSubs.push(notify);
    return () => {
      this.syncGlobalSubs = this.syncGlobalSubs.filter(n => n!==notify);
    };
  }

  subscribeSyncMyHacks(notify: (e:SynchronizeJudge) => void): () => void {
    this.syncJudgeSubs.push(notify);
    return () => {
      this.syncJudgeSubs = this.syncJudgeSubs.filter(n => n!==notify);
    };
  }

  subscribeProtocolError(notify: (e:ProtocolError) => void): () => void {
    this.protoErrSubs.push(notify);
    return () => {
      this.protoErrSubs = this.protoErrSubs.filter(n => n!==notify);
    };
  }
}

export interface SledgeOptions {
  host : string;
}

export const enum SledgeStatus {
  Connecting = "SLEDGECLIENT_CONNECTING",
  Connected = "SLEDGECLIENT_CONNECTED",
  Reconnecting = "SLEDGECLIENT_RECONNECTING",
  Disconnected = "SLEDGECLIENT_DISCONNECTED"
}
