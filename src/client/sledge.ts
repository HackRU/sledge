import io from "socket.io-client";

import * as evts from "../protocol/events.js";
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

  private syncGlobalSubs: Array<(e:evts.SynchronizeGlobal) => void>;
  private syncJudgeSubs: Array<(e:evts.SynchronizeJudge) => void>;
  private protoErrSubs: Array<(e:evts.ProtocolError) => void>;
  private statusSubs: Array<(s:SledgeStatus) => void>;

  constructor(opts : SledgeOptions) {
    this.socket = io(opts.host, { reconnection: false });
    this.responseResolvers = new Map();

    this.syncGlobalSubs = [];
    this.syncJudgeSubs = [];
    this.protoErrSubs = [];
    this.statusSubs = [];

    this.setupResolverDispatch(evts.addRowResponse);
    this.setupResolverDispatch(evts.authenticateResponse);
    this.setupResolverDispatch(evts.genericResponse);
    this.setupResolverDispatch(evts.loginResponse);

    this.socket.on("ProtocolError", (e:evts.ProtocolError) => {
      console.warn("ProtocolError for %s\n%s", e.eventName, e.message);
      if (e.original) console.warn(e.original);
      for (let notify of this.protoErrSubs) notify(e);
    });

    this.socket.on("SynchronizeGlobal", (e: evts.SynchronizeGlobal) => {
      this.syncGlobalSubs.forEach(n => n(e));
    });
    this.socket.on("SynchronizeJudge", (e: evts.SynchronizeJudge) => {
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

  private setupResolverDispatch(meta : evts.ResponseMeta) {
    this.socket.on(meta.name, (data:evts.Response) => {
      let resolver = this.responseResolvers.get(data.returnId);
      if (resolver) {
        resolver(data);
        this.responseResolvers.delete(data.returnId);
      } else {
        throw new Error("Got response with unknown returnId: " + data.returnId);
      }
    });
  }

  private sendAndAwait(eventName : string, data : evts.Request) : Promise<any> {
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
    Req extends evts.Request,
    Res extends evts.Response
  >(evt: evts.RequestMeta): (this: SledgeClient, r: Req) => Promise<Res> {
    return function (req) {
      return this.sendAndAwait(evt.name, req);
    }
  }

  ////////////////////
  // Requests

  sendAddRow = this.genSender<
    evts.AddRow, evts.AddRowResponse>(evts.addRow);
  sendAuthenticate = this.genSender<
    evts.Authenticate, evts.AuthenticateResponse>(evts.authenticate);
  sendLogin = this.genSender<
    evts.Login, evts.LoginResponse>(evts.login);
  sendModifyRow = this.genSender<
    evts.ModifyRow, evts.GenericResponse>(evts.modifyRow);
  sendRateHack = this.genSender<
    evts.RateHack, evts.GenericResponse>(evts.rateHack);
  sendRankSuperlative = this.genSender<
    evts.RankSuperlative, evts.GenericResponse>(evts.rankSuperlative);
  sendSetJudgeHackPriority = this.genSender<
    evts.SetJudgeHackPriority, evts.GenericResponse>(evts.setJudgeHackPriority);
  sendSetSynchronizeGlobal = this.genSender<
    evts.SetSynchronizeGlobal, evts.GenericResponse>(evts.setSynchronizeGlobal);
  sendSetSynchronizeJudge = this.genSender<
    evts.SetSynchronizeJudge, evts.GenericResponse>(evts.setSynchronizeJudge);

  ////////////////////
  // Updates

  subscribeStatus(notify: (s:SledgeStatus) => void): () => void {
    this.statusSubs.push(notify);
    return () => {
      this.statusSubs = this.statusSubs.filter(n => n!==notify);
    };
  }

  subscribeSyncGlobal(notify: (e:evts.SynchronizeGlobal) => void): () => void {
    this.syncGlobalSubs.push(notify);
    return () => {
      this.syncGlobalSubs = this.syncGlobalSubs.filter(n => n!==notify);
    };
  }

  subscribeSyncMyHacks(notify: (e:evts.SynchronizeJudge) => void): () => void {
    this.syncJudgeSubs.push(notify);
    return () => {
      this.syncJudgeSubs = this.syncJudgeSubs.filter(n => n!==notify);
    };
  }

  subscribeProtocolError(notify: (e:evts.ProtocolError) => void): () => void {
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
