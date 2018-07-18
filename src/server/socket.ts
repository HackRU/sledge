import http from "http";
import {randomFillSync} from "crypto";
import {default as socketio, Server, Socket}  from "socket.io";

import * as e from "../protocol/events.js";
import {Table} from "../protocol/database.js";
import {DatabaseConnection} from "./persistence/database.js";
import {ServerEventWrapper, ServerEventHandlers} from "./eventwrapper.js";

export class SocketCommunication {
  private sio : Server;
  private events : ServerEventWrapper;
  private clients : Map<string, ClientInfo>;

  private sharedSyncTime: number = 0;
  private sharedSyncTimer: NodeJS.Timer;

  constructor(private server : http.Server, private db : DatabaseConnection) {
    this.sio = socketio(server);
    this.events = new ServerEventWrapper(this.sio, this.handlers);
    this.clients = new Map<string, ClientInfo>();
  }

  public handlers : ServerEventHandlers = {

    onConnect: (sid : string) => {
      this.clients.set(sid, {
        privilege: -1,
        syncedShared: false,
        syncedJudge: 0
      });
    },

    onDisconnect: (sid : string) => {
      this.clients.delete(sid);
    },

    onAddRow: (sid: string, data: e.AddRow) => {
      if (!this.can(sid, 0)) {
        return Promise.resolve({
          success: false,
          message: "Only admins can do that.",
          newRowId: -1
        });
      }

      let res: {id: number};
      let shared = false;
      switch (data.table) {
        case Table.Category:
          res = this.db.addCategory(data.row);
          shared = true;
          break;
        case Table.Hack:
          res = this.db.addHack(data.row);
          shared = true;
          break;
        case Table.Judge:
          res = this.db.addJudge(data.row);
          shared = true;
          break;
        case Table.JudgeHack:
          res = this.db.addJudgeHack(data.row);
          shared = true;
          break;
        case Table.Superlative:
          res = this.db.addSuperlative(data.row);
          shared = true;
          break;
        case Table.SuperlativeHack:
          res = this.db.addSuperlativeHack(data.row);
          break;
        case Table.Token:
          res = this.db.addToken(data.row);
          break;
        default:
          return Promise.resolve({
            success: false,
            message: "Unavailable for table: " + (data as any).table,
            newRowId: -1
          });
      }

      if (shared) {
        this.dispatchSync();
      }

      return Promise.resolve({
        success: true,
        message: "success",
        newRowId: res.id
      });
    },

    onAuthenticate: (sid : string, data : e.Authenticate) => {
      let clientData = this.clients.get(sid);
      if (data.secret === "") {
        clientData.privilege = -1;
        return Promise.resolve({
          success: true,
          message: "success",
          privilege: -1
        });
      }

      let token = this.db.getTokenBySecret(data.secret);

      if (token) {
        clientData.privilege = token.privilege;
        return Promise.resolve({
          success: true,
          message: "success",
          privilege: token.privilege
        });
      } else {
        return Promise.resolve({
          success: false,
          message: "Bad secret",
          privilege: clientData.privilege
        });
      }
    },

    onLogin: (sid : string, data : e.Login) => {
      return this.nyi(sid, "Login");
    },

    onModifyRow: (sid: string, data: e.ModifyRow) => {
      if (!this.can(sid, 0)) {
        return Promise.resolve({
          success: false,
          message: "Only admins can do that."
        });
      }

      let shared = false;
      switch (data.table) {
        case Table.Hack:
          this.db.modifyHack(data.id, data.diff);
          shared = true;
          break;
        default:
          return Promise.resolve({
            success: false,
            message: "Modify not supported on table " + (data as any).table
          });
      }

      if (shared) {
        this.dispatchSync();
      }

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onRateHack: (sid : string, data : e.RateHack) => {
      return this.nyi(sid, "RateHack");
    },

    onRankSuperlative: (sid : string, data : e.RankSuperlative) => {
      return this.nyi(sid, "RankSuperlative");
    },

    onSetJudgeHackPriority: (sid: string, data: e.SetJudgeHackPriority) => {
      if (!this.can(sid, 0)) {
        return Promise.resolve({
          success: false,
          message: "Only admins can do that."
        });
      }

      this.db.changeJudgeHackPriority({
        judgeId: data.judgeId,
        hackId: data.hackId,
        newPriority: data.priority
      });

      process.nextTick(() => {
        let judgeHackIds = this.db.getHackIdsOfJudge(data.judgeId);
        this.clients.forEach((client, sid) => {
          if (client.syncedJudge === data.judgeId) {
            this.events.sendSynchronizeMyHacks(sid, {
              judgeId: data.judgeId,
              hackIds: judgeHackIds
            });
          }
        });

        this.dispatchSync();
      });

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onSetSynchronizeShared: (sid : string, data: e.SetSynchronizeShared) => {
      this.events.sendSynchronizeShared(sid, this.getSyncSharedData());
      this.clients.get(sid).syncedShared = data.syncShared;

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onSetSynchronizeMyHacks: (sid: string, data: e.SetSynchronizeMyHacks) => {
      if (!this.can(sid, data.judgeId)) {
        return Promise.resolve({
          success: false,
          message: "You can't see hacks of judges your not privileged as"
        });
      }

      this.events.sendSynchronizeMyHacks(sid, {
        judgeId: data.judgeId,
        hackIds: this.db.getHackIdsOfJudge(data.judgeId)
      });

      let clientData = this.clients.get(sid);
      if (data.syncMyHacks) {
        clientData.syncedJudge = data.judgeId;
      } else {
        clientData.syncedJudge = 0;
      }

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

  }

  private getSyncSharedData(): e.SynchronizeShared {
    return {
      hacks: this.db.getAllHacks(),
      judges: this.db.getAllJudges(),
      superlatives: this.db.getAllSuperlatives(),
      superlativeHacks: this.db.getAllSuperlativeHacks(),
      categories: this.db.getAllCategories(),

      judgeHackMatrix: this.db.getJudgeHackMatrix()
    };
  }

  private dispatchSyncTo(data: e.SynchronizeShared, admin: boolean, sid: string) {
    let dataForClient : e.SynchronizeShared;
    if (admin) {
      dataForClient = data;
    } else {
      dataForClient = {
        hacks: data.hacks,
        judges: data.judges,
        superlatives: data.superlatives,
        superlativeHacks: data.superlativeHacks,
        categories: data.categories
      };
    }

    this.events.sendSynchronizeShared(sid, dataForClient);
  }

  private dispatchSync() {
    let now = Date.now();
    let timeDiff = now - this.sharedSyncTime;
    if (timeDiff < 500) {
      if (!this.sharedSyncTimer) {
        this.sharedSyncTimer =
          setTimeout(() => this.dispatchSync(), timeDiff);
      }
      return;
    }

    if (this.sharedSyncTimer) {
      clearTimeout(this.sharedSyncTimer);
      this.sharedSyncTimer = null;
    }

    let data = this.getSyncSharedData();

    this.clients.forEach((v, k) => {
      if (v.syncedShared) {
        this.dispatchSyncTo(data, v.privilege===0, k);
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
  syncedShared: boolean;
  syncedJudge: number;
}
