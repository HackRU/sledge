import * as io  from "socket.io-client";

import * as evts                from "lib/protocol/events.js";
import {DataStore, TablePart}   from "lib/protocol/database.js";

export class SledgeClient {
  socket : SocketIOClient.Socket;
  subscribers : Array<Subscriber>;
  initialized : boolean;
  store : DataStore;

  constructor(opts : SledgeOptions) {
    this.store = {
      hacks: [],
      judges: [],
      judgeHacks: [],
      superlatives: [],
      superlativePlacements: []
    };

    this.socket = io(opts.host);

    this.socket.on("login-response", this.handleLoginResponse);
    this.socket.on("protocol-error", this.handleProtocolError);
    this.socket.on("update-full", this.handleUpdateFull);
    this.socket.on("update-partial", this.handleUpdatePartial);
  }

  private updateTables(data : DataStore) {
    let unsafeStore = <any>this.store;

    let tables = ["hacks", "judges", "judgeHacks", "superlatives", "superlativePlacements"];
    for (let table of tables) {
      let rows : TablePart<{ id : number | undefined }> = unsafeStore[table];
      for (let row of rows) {
        if (row && row.id) {
          unsafeStore[table][row.id] = row;
        }
      }
    }
  }

  getData() : DataStore {
    let copy : DataStore = {
      hacks: this.store.hacks.map(shallowCopy),
      judges: this.store.judges.map(shallowCopy),
      judgeHacks: this.store.judgeHacks.map(shallowCopy),
      superlatives: this.store.superlatives.map(shallowCopy),
      superlativePlacements: this.store.superlativePlacements.map(shallowCopy)
    };

    return copy;
  }

  subscribe(notify : (e:SledgeEvent) => void) {
    this.subscribers.push({notify});
  }

  public handleLoginResponse = (data : evts.LoginResponse) => {
    console.log(data);
    throw new Error("NYI");
  }

  public handleProtocolError = (data : evts.ProtocolError) => {
    console.log(data);
    alert(data.message);
  }

  public handleUpdateFull = (data : evts.UpdateFull) => {
    console.log(data);
    throw new Error("NYI");
  }

  public handleUpdatePartial = (data : evts.UpdatePartial) => {
    console.log(data);
    throw new Error("NYI");
  }

  public emitAddHack(data : evts.AddHack) {
    this.socket.emit("add-hack", data);
  }

  public emitAddJudge(data : evts.AddJudge) {
    this.socket.emit("add-judge", data);
  }

  public emitAddSuperlative(data : evts.AddSuperlative) {
    this.socket.emit("add-superlative", data);
  }

  public emitAuthenticate(data : evts.Authenticate) {
    this.socket.emit("authenticate", data);
  }

  public emitLogin(data : evts.Login) {
    this.socket.emit("login", data);
  }

  public emitRateHack(data : evts.RateHack) {
    this.socket.emit("rate-hack", data);
  }

  public emitRankSuperlative(data : evts.RankSuperlative) {
    this.socket.emit("rank-superlative", data);
  }

  public emitSubscribeDatabase(data : evts.SubscribeDatabase) {
    this.socket.emit("subscribe-database", data);
  }

  private sendChange(evt : SledgeEvent) {
    for (let sub of this.subscribers) {
      sub.notify(evt);
    }
  }

  private onProtocolError(data : evts.ProtocolError) {
    alert(data.message);
  }
};

export interface SledgeOptions {
  host : string;
};

export interface SledgeEvent {
  trans : boolean;
  message : string;
};

interface Subscriber {
  notify : (e:SledgeEvent) => void;
};

function shallowCopy(obj : any) : any {
  let copy : any = {};
  for (let key in obj) {
    copy[key] = obj[key];
  }
  return copy;
}
