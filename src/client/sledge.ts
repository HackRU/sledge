import io from "socket.io-client";

import * as evts from "lib/protocol/events";
import * as db from "lib/protocol/database";

/**
 * A SledgeClient wraps the regular SocketIO client to make a sledge-specific
 * client, handling the following aspects
 *  - Event Types
 *  - Request/Response handling with promises
 *  - Autoreconnect and Autoreauthentication
 */
export class SledgeClient {
  socket : SocketIOClient.Socket;

  responseResolvers : Map<string, (r:any) => void>;
  synchronizeSubscribers : Array<(e:evts.Synchronize) => void>;

  constructor(opts : SledgeOptions) {
    this.socket = io(opts.host);
    this.responseResolvers = new Map();
    this.synchronizeSubscribers = [];

    this.setupResolverDispatch("AuthenticateResponse");
    this.setupResolverDispatch("GenericResponse");
    this.setupResolverDispatch("LoginResponse");

    this.socket.on("ProtocolError", (e:evts.ProtocolError) => {
      console.warn("ProtocolError for %s\n%s", e.eventName, e.message);
      if (e.original) console.warn(e.original);
    });

    this.socket.on("Synchronize", (e:evts.Synchronize) => {
      for (let notify of this.synchronizeSubscribers) {
        if (notify) notify(e);
      }
    });
  }

  private setupResolverDispatch(eventName : string) {
    this.socket.on(eventName, (data:evts.Response) => {
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
    let returnId = Date.now().toString(16);
    this.socket.emit(eventName, {...data, returnId});
    return new Promise( (resolve, reject) => {
      this.responseResolvers.set(returnId, resolve);
    });
  }

  sendAddHack(data : evts.AddHack) : Promise<evts.GenericResponse> {
    return this.sendAndAwait("AddHack", data);
  }

  sendAddJudge(data : evts.AddJudge) : Promise<evts.GenericResponse> {
    return this.sendAndAwait("AddJudge", data);
  }

  sendAddSuperlative(data : evts.AddSuperlative) : Promise<evts.GenericResponse> {
    return this.sendAndAwait("AddSuperlative", data);
  }

  sendAuthenticate(data : evts.Authenticate) : Promise<evts.AuthenticateResponse> {
    return this.sendAndAwait("Authenticate", data);
  }

  sendLogin(data : evts.Login) : Promise<evts.LoginResponse> {
    return this.sendAndAwait("Login", data);
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

  subscribeSynchronize(notify : (e:evts.Synchronize) => void) : () => void {
    let i = this.synchronizeSubscribers.length;
    this.synchronizeSubscribers[i] = notify;
    return () => { delete this.synchronizeSubscribers[i]; };
  }
}

export interface SledgeOptions {
  host : string;
}
