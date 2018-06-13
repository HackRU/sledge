import http from "http";
import {randomFillSync} from "crypto";
import {default as socketio, Server, Socket}  from "socket.io";

import * as evts from "../protocol/events.js";
import {DatabaseConnection} from "./persistence/database.js";
import {ServerEventWrapper, ServerEventHandlers} from "./eventwrapper.js";

export class SocketCommunication {
  private sio : Server;
  private events : ServerEventWrapper;
  private clients : Map<string, ClientInfo>;

  constructor(private server : http.Server, private db : DatabaseConnection) {
    this.sio = socketio(server);
    this.events = new ServerEventWrapper(this.sio, this.handlers);
  }

  public handlers : ServerEventHandlers = {

    onConnect: (sid : string) => {
      this.clients.set(sid, { privilege: -1 });
    },

    onDisconnect: (sid : string) => {
      this.clients.delete(sid);
    },

    onAddHack: (sid : string, data : evts.AddHack) => {
      return this.genericPriv(sid, 0, () => { this.db.addHack(data.hack) });
    },

    onAddJudge: (sid : string, data : evts.AddJudge) => {
      return this.genericPriv(sid, 0, () => { this.db.addJudge(data.judge) });
    },

    onAddSuperlative: (sid : string, data : evts.AddSuperlative) => {
      return this.genericPriv(sid, 0, () => { this.db.addSuperlative(data.superlative) });
    },

    onAuthenticate: (sid : string, data : evts.Authenticate) => {
      return this.nyi(sid, "Authenticate");
    },

    onLogin: (sid : string, data : evts.Login) => {
      return this.nyi(sid, "Login");
    },

    onRateHack: (sid : string, data : evts.RateHack) => {
      return this.nyi(sid, "RateHack");
    },

    onRankSuperlative: (sid : string, data : evts.RankSuperlative) => {
      return this.nyi(sid, "RankSuperlative");
    },

    onSetSynchronize: (sid : string, data : evts.SetSynchronize) => {
      return this.nyi(sid, "SetSynchronize");
    }

  }

  /**
   * Given a client's id and a privilege level return if that client should
   * be able to perform an action at that privilege
   */
  private can(sid : string, testPrivilege : number) : boolean {
    let clientPrivilege = this.clients.get(sid).privilege;
    return (
      clientPrivilege === 0 ||
      clientPrivilege === testPrivilege ||
      testPrivilege < 0
    );
  }

  /**
   * This factors out a common pattern of request handling, whereas if the
   * client is of a certain privilege an action is performed and
   * GenericResponse is returned, otherwise an appropriate error is returned.
   */
  private genericPriv = (sid : string, testPrivilege : number, action : () => void) => {
    if (this.can(sid, testPrivilege)) {
      action();
      return Promise.resolve({
        success: true,
        message: "success"
      });
    } else {
      let message;
      if (testPrivilege === 0)  {
        message = "Only admins can do that.";
      } else {
        message = "Only admins or the judge with id " + testPrivilege + " can do that.";
      }

      return Promise.resolve({
        success: false, message
      });
    }
  }

  private nyi(sid : string, eventName : string) : Promise<any> {
    this.events.sendProtocolError(sid, {
      eventName,
      message: "Not Yet Implemented"
    });

    return Promise.resolve({});
  }
}

export interface ClientInfo {
  privilege : number;
}
