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
  socket : SocketIOClient.Socket;
  status : SledgeStatus = SledgeStatus.Connecting;

  responseResolvers : Map<string, (r:any) => void>;
  synchronizeSubscribers : Array<(e:evts.Synchronize) => void>;
  statusSubscribers: Array<(s:SledgeStatus) => void>;

  constructor(opts : SledgeOptions) {
    this.socket = io(opts.host);
    this.responseResolvers = new Map();
    this.synchronizeSubscribers = [];
    this.statusSubscribers = [];

    this.setupResolverDispatch(evts.addRowResponse);
    this.setupResolverDispatch(evts.authenticateResponse);
    this.setupResolverDispatch(evts.genericResponse);
    this.setupResolverDispatch(evts.loginResponse);

    this.socket.on("ProtocolError", (e:evts.ProtocolError) => {
      console.warn("ProtocolError for %s\n%s", e.eventName, e.message);
      if (e.original) console.warn(e.original);
    });

    this.socket.on("Synchronize", (e:evts.Synchronize) => {
      for (let notify of this.synchronizeSubscribers) {
        if (notify) notify(e);
      }
    });

    this.socket.on("connect", () => {
      this.status = SledgeStatus.Connected;
      this.dispatchStatus();
    });
    this.socket.on("reconnecting", () => {
      this.status = SledgeStatus.Reconnecting;
      this.dispatchStatus();
    });
    this.socket.on("reconnect_failed", () => {
      this.status = SledgeStatus.Disconnected;
      this.dispatchStatus();
    });
  }

  private dispatchStatus() {
    for (let d of this.statusSubscribers) {
      if (d) d(this.status);
    }
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
    const randomness = 16;
    let entropy = (Date.now() << randomness) + Math.floor(Math.random()*Math.pow(2,randomness));
    return entropy.toString(16);
  }

  sendAddCategory(data: evts.AddCategory): Promise<evts.AddRowResponse> {
    return this.sendAndAwait("AddCategory", data);
  }

  sendAddHack(data : evts.AddHack) : Promise<evts.AddRowResponse> {
    return this.sendAndAwait("AddHack", data);
  }

  sendAddJudge(data : evts.AddJudge) : Promise<evts.AddRowResponse> {
    return this.sendAndAwait("AddJudge", data);
  }

  sendAddJudgeHack(data: evts.AddJudgeHack): Promise<evts.AddRowResponse> {
    return this.sendAndAwait("AddJudgeHack", data);
  }

  sendAddSuperlative(data : evts.AddSuperlative) : Promise<evts.AddRowResponse> {
    return this.sendAndAwait("AddSuperlative", data);
  }

  sendAddSuperlativeHack(data: evts.AddSuperlativeHack): Promise<evts.AddRowResponse> {
    return this.sendAndAwait("AddSuperlativeHack", data);
  }

  sendAuthenticate(data : evts.Authenticate) : Promise<evts.AuthenticateResponse> {
    return this.sendAndAwait("Authenticate", data);
  }

  sendLogin(data : evts.Login) : Promise<evts.LoginResponse> {
    return this.sendAndAwait("Login", data);
  }

  sendModifyHack(data: evts.ModifyHack): Promise<evts.GenericResponse> {
    return this.sendAndAwait("ModifyHack", data);
  }

  sendRateHack(data : evts.RateHack) : Promise<evts.GenericResponse> {
    return this.sendAndAwait("RateHack", data);
  }

  sendRankSuperlative(data : evts.RankSuperlative) : Promise<evts.GenericResponse> {
    return this.sendAndAwait("RankSuperlative", data);
  }

  sendSetSynchronize(data : evts.SetSynchronize) : Promise<evts.GenericResponse> {
    return this.sendAndAwait("SetSynchronize", data);
  }

  subscribeStatus(notify: (s:SledgeStatus) => void): () => void {
    this.statusSubscribers.push(notify);
    return () => {
      this.statusSubscribers = this.statusSubscribers.filter(n => n!==notify);
    }
  }

  subscribeSynchronize(notify : (e:evts.Synchronize) => void) : () => void {
    let i = this.synchronizeSubscribers.length;
    this.synchronizeSubscribers[i] = notify;
    return () => { delete this.synchronizeSubscribers[i]; };
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
