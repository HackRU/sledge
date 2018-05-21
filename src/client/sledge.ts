import io from "socket.io-client";

import * as evts                                      from "lib/protocol/events";
import {DataStore, TablePart, getEmptyStore, tableNames} from "lib/protocol/database";

export class SledgeClient {
  store : SledgeData;
  socket : SocketIOClient.Socket;
  subscribers : Array<Subscriber>;

  constructor(opts : SledgeOptions) {
    this.store = {
      auth: { authed: false },
      connectionStatus: ConnectionStatus.Connecting,

      ...getEmptyStore()
    };

    this.socket = io(opts.host);

    this.socket.on("connection", this.handleConnection);
    this.socket.on("reconnect", this.handleReconnect);
    this.socket.on("disconnect", this.handleDisconnect);
    this.socket.on("reconnect_failed", this.handleReconnectFailed);

    this.socket.on("authenticate-response", this.handleAuthenticateResponse);
    this.socket.on("login-response", this.handleLoginResponse);
    this.socket.on("protocol-error", this.handleProtocolError);
    this.socket.on("update-full", this.handleUpdateFull);
    this.socket.on("update-partial", this.handleUpdatePartial);

    this.subscribers = [];
  }

  private resetTables() {
    let unsafeStore = <any>this.store;

    for (let table of tableNames) {
      unsafeStore[table].length = 0;
    }
  }

  private updateTables(data : DataStore) {
    let unsafeStore = <any>this.store;
    let unsafeData = <any>data;

    for (let table of tableNames) {
      let rows : TablePart<{ id : number | undefined }> = unsafeData[table];
      for (let row of rows) {
        if (row && row.id) {
          unsafeStore[table][row.id] = row;
        }
      }
    }
  }

  getData() : SledgeData {
    return {
      auth: shallowCopy(this.store.auth),
      connectionStatus: this.store.connectionStatus,

      hacks: this.store.hacks.map(shallowCopy),
      judges: this.store.judges.map(shallowCopy),
      judgeHacks: this.store.judgeHacks.map(shallowCopy),
      ratings: this.store.ratings.map(shallowCopy),
      superlatives: this.store.superlatives.map(shallowCopy),
      superlativePlacements: this.store.superlativePlacements.map(shallowCopy)
    };
  }

  subscribe(notify : (e:SledgeEvent) => void) {
    this.subscribers.push({notify});
  }

  public handleConnection = () => {
    this.store.connectionStatus = ConnectionStatus.Connected;

    this.sendChange({
      trans: false,
      message: "Connected"
    });
  }

  public handleReconnect = (attempt : number) => {
    if (this.store.auth.authed) {
      this.store.connectionStatus = ConnectionStatus.Reauthenticating;

      this.sendChange({
        trans: false,
        message: "Reconnected, and will attempt to reauthenticate"
      });

      this.emitAuthenticate({
        secret: this.store.auth.secret,
        userId: this.store.auth.userId
      });
    } else {
      this.store.connectionStatus = ConnectionStatus.Connected;

      this.sendChange({
        trans: false,
        message: "Reconnected"
      });
    }
  }

  public handleDisconnect = (reason : string) => {
    this.store.connectionStatus = ConnectionStatus.Reconnecting;

    this.sendChange({
      trans: false,
      message: "Disconnected, will attempt reconnect"
    });
  }

  public handleReconnectFailed = () => {
    this.store.connectionStatus = ConnectionStatus.Disconnected;

    this.sendChange({
      trans: false,
      message: "Disconnected"
    });
  }

  public handleAuthenticateResponse = (data : evts.AuthenticateResponse) => {
    if (this.store.connectionStatus === ConnectionStatus.Reauthenticating) {
      if (
        !data.success ||
        data.userId !== this.store.auth.userId ||
        data.judgeId !== this.store.auth.judgeId
      ) {
        this.hardFail("Unable to Reauthenticate");
      } else {
        this.store.connectionStatus = ConnectionStatus.Connected;

        this.sendChange({
          trans: false,
          message: "Reauthenticated"
        });

        return;
      }
    }

    if (data.success) {
      this.store.auth.authed = true;
      this.store.auth.userId = data.userId;
      this.store.auth.judgeId = data.judgeId;
    } else {
      // TODO: For the sake of admin pages, there may be a more elegant way to handle
      //       this
      this.hardFail("Unable to Authenticate");
    }

    this.sendChange({
      trans: false,
      message: "Got Authenticate Response"
    });
  }

  public handleLoginResponse = (data : evts.LoginResponse) => {
    console.log(data);
    throw new Error("NYI");
  }

  public handleProtocolError = (data : evts.ProtocolError) => {
    console.warn("Protocol Error from %s!\n%s", data.original, data.message);
  }

  public handleUpdateFull = (data : evts.UpdateFull) => {
    this.resetTables();
    this.updateTables(data.database);

    this.sendChange({
      trans: false,
      message: "Full Update"
    });
  }

  public handleUpdatePartial = (data : evts.UpdatePartial) => {
    this.updateTables(data.diff);

    this.sendChange({
      trans: false,
      message: "Partial Update"
    });
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
    this.store.auth.secret = data.secret;

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

  public emitSubscribeDatabase() {
    this.socket.emit("subscribe-database", {});
  }

  private sendChange(evt : SledgeEvent) {
    for (let sub of this.subscribers) {
      sub.notify(evt);
    }
  }

  private hardFail(reason : string) {
    this.socket.close();
    this.store.connectionStatus = ConnectionStatus.Disconnected;

    this.sendChange({
      trans: false,
      message: "Hard Fail: " + reason
    });

    console.error(new Error("Sledge Client (Hard Fail): " + reason));
  }
}

export interface SledgeOptions {
  host : string;
}

export interface SledgeEvent {
  trans : boolean;
  message : string;
}

export interface SledgeData extends DataStore {
  auth : { authed : boolean, userId? : number, judgeId? : number, secret? : string };
  connectionStatus : ConnectionStatus;
}

export const enum ConnectionStatus {
  Waiting = "CLIENT_CONNECTIONSTATUS_WAITING",
  Connecting = "CLIENT_CONNECTIONSTATUS_CONNECTING",
  Connected = "CLIENT_CONNECTIONSTATUS_CONNECTED",
  Reconnecting = "CLIENT_CONNECTIONSTATUS_RECONNECTING",
  Reauthenticating = "CLIENT_CONNECTIONSTATUS_REAUTHENTICATING",
  Disconnected = "CLIENT_CONNECTIONSTATUS_DISCONNECTED"
}

interface Subscriber {
  notify : (e:SledgeEvent) => void;
}

function shallowCopy(obj : any) : any {
  let copy : any = {};
  for (let key in obj) {
    copy[key] = obj[key];
  }
  return copy;
}
