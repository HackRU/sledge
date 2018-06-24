import http from "http";
import {randomFillSync} from "crypto";
import {default as socketio, Server, Socket}  from "socket.io";

import * as e from "../protocol/events.js";
import {DatabaseConnection} from "./persistence/database.js";
import {ServerEventWrapper, ServerEventHandlers} from "./eventwrapper.js";

export class SocketCommunication {
  private sio : Server;
  private events : ServerEventWrapper;
  private clients : Map<string, ClientInfo>;

  constructor(private server : http.Server, private db : DatabaseConnection) {
    this.sio = socketio(server);
    this.events = new ServerEventWrapper(this.sio, this.handlers);
    this.clients = new Map<string, ClientInfo>();
  }

  public handlers : ServerEventHandlers = {

    onConnect: (sid : string) => {
      this.clients.set(sid, {
        privilege: -1,
        synced: false
      });
    },

    onDisconnect: (sid : string) => {
      this.clients.delete(sid);
    },

    onAddCategory: (sid: string, data: e.AddCategory) => {
      return this.genericAdd(sid, () => this.db.addCategory(data.category));
    },

    onAddHack: (sid : string, data : e.AddHack) => {
      return this.genericAdd(sid, () => this.db.addHack(data.hack));
    },

    onAddJudge: (sid : string, data : e.AddJudge) => {
      return this.genericAdd(sid, () => this.db.addJudge(data.judge));
    },

    onAddJudgeHack: (sid: string, data: e.AddJudgeHack) => {
      return this.genericAdd(sid, () => this.db.addJudgeHack(data.judgeHack));
    },

    onAddSuperlative: (sid : string, data : e.AddSuperlative) => {
      return this.genericAdd(sid, () => this.db.addSuperlative(data.superlative));
    },

    onAddSuperlativeHack: (sid: string, data: e.AddSuperlativeHack) => {
      return this.genericAdd(sid, () => this.db.addSuperlativeHack(data.superlativeHack));
    },

    onAuthenticate: (sid : string, data : e.Authenticate) => {
      let clientData = this.clients.get(sid);
      // TODO: Check database
      if (data.secret === "") {
        clientData.privilege = -1;
        return Promise.resolve({
          success: true,
          message: "success",
          privilege: -1
        });
      } else if (data.secret === "badsecret") {
        clientData.privilege = 0;
        return Promise.resolve({
          success: true,
          message: "success",
          privilege: 0
        });
      } else {
        return Promise.resolve({
          success: false,
          message: "Bad secret (hint: test secret is badsecret)",
          privilege: clientData.privilege
        });
      }
    },

    onLogin: (sid : string, data : e.Login) => {
      return this.nyi(sid, "Login");
    },

    onModifyHack: (sid: string, data: e.ModifyHack) => {
      return this.privliged(sid, 0, () => {
        let result = this.db.modifyHack(data.hackId, data.hack);
        if (result) {
          this.dispatchSync();
          return Promise.resolve({
            success: true,
            message: "success"
          });
        } else {
          return Promise.resolve({
            success: false,
            message: "Hack does not exist."
          });
        }
      });
    },

    onRateHack: (sid : string, data : e.RateHack) => {
      return this.nyi(sid, "RateHack");
    },

    onRankSuperlative: (sid : string, data : e.RankSuperlative) => {
      return this.nyi(sid, "RankSuperlative");
    },

    onSetSynchronize: (sid : string, data : e.SetSynchronize) => {
      return new Promise(resolve => {
        process.nextTick(() => {
          this.events.sendSynchronize(sid, this.getSyncData());
          this.clients.get(sid).synced = data.sync;
          resolve({
            success: true,
            message: "success"
          });
        });
      });
    }

  }

  private getSyncData(): e.Synchronize {
    return {
      hacks: this.db.getAllHacks(),
      judges: this.db.getAllJudges(),
      superlatives: this.db.getAllSuperlatives(),
      superlativeHacks: this.db.getAllSuperlativeHacks(),
      categories: this.db.getAllCategories()
    };
  }

  private dispatchSync() {
    let syncData = this.getSyncData();
    this.clients.forEach((v, k) => {
      if (v.synced) {
        this.events.sendSynchronize(k, syncData);
      }
    });
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
  private privliged = <R extends e.Response>(
    sid: string,
    testPrivilege: number,
    action: () => Promise<R>
  ): Promise<R> => {
    if (this.can(sid, testPrivilege)) {
      return action();
    } else {
      let message;
      if (testPrivilege === 0)  {
        message = "Only admins can do that.";
      } else {
        message = "Only admins or the judge with id " + testPrivilege + " can do that.";
      }

      return Promise.resolve({
        success: false, message
      } as R);
    }
  }

  /**
   * Factors out adding rows
   */
  private genericAdd = (sid: string, action: () => {id: number}) => {
    if (this.can(sid, 0)) {
      let result = action();
      this.dispatchSync();
      return Promise.resolve({
        success: true,
        message: "success",
        newRowId: result.id
      });
    } else {
      return Promise.resolve({
        success: false,
        message: "Only admins can do that.",
        newRowId: -1
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
  privilege: number;
  synced: boolean;
}
