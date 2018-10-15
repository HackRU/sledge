import http from "http";
import {randomFillSync} from "crypto";
import uuidv4 from "uuid";
import {default as socketio, Server, Socket}  from "socket.io";

import * as e from "../protocol/events.js";
import {Table} from "../protocol/database.js";
import {DatabaseConnection} from "./persistence.js";
import {ServerEventWrapper, ServerEventHandlers} from "./eventwrapper.js";
import {ClientStateManager} from "./clientstatemanager";
import {SyncManager} from "./syncmanager";

export class SocketCommunication {
  private sio: Server;
  private events: ServerEventWrapper;
  private clients: ClientStateManager;
  private sync: SyncManager;

  constructor(private server : http.Server, private db : DatabaseConnection) {
    this.sio = socketio(server);
    this.events = new ServerEventWrapper(this.sio, this.handlers);
    this.clients = new ClientStateManager();
    this.sync = new SyncManager(this.events, this.db, this.clients);
  }

  public handlers : ServerEventHandlers = {

    onConnect: (sid : string) => {
      this.clients.registerClient(sid);
    },

    onDisconnect: (sid : string) => {},

    onAddRow: (sid: string, data: e.AddRow) => {
      if (!this.clients.can(sid, 0)) {
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
        this.sync.scheduleFullGlobalSync();
      }

      return Promise.resolve({
        success: true,
        message: "success",
        newRowId: res.id
      });
    },

    onAuthenticate: (sid : string, data : e.Authenticate) => {
      // An empty secret always corresponds to unprivileged
      if (data.secret === "") {
        this.clients.setClientPrivilege(sid, -1);

        return Promise.resolve({
          success: true,
          message: "success",
          privilege: -1
        });
      }

      let token = this.db.getTokenBySecret(data.secret);

      if (token) {
        this.clients.setClientPrivilege(sid, token.privilege);

        process.nextTick(() => {
          this.sync.sendGlobalSync(sid);
        });

        return Promise.resolve({
          success: true,
          message: "success",
          privilege: token.privilege
        });
      } else {
        return Promise.resolve({
          success: false,
          message: "Bad secret",
          privilege: this.clients.getClientPrivilege(sid)
        });
      }
    },

    onLogin: (sid: string, data: e.Login) => {
      if (!this.clients.can(sid, 0) && data.loginCode !== "0000") {
        return Promise.resolve({
          success: false,
          message: "Must have login code or be admin.",
          judgeId: 0,
          secret: ""
        });
      }

      let secret = uuidv4();
      this.db.addToken({
        secret,
        privilege: data.judgeId
      });

      return Promise.resolve({
        success: true,
        message: "success",
        judgeId: data.judgeId,
        secret
      });
    },

    onModifyRow: (sid: string, data: e.ModifyRow) => {
      if (!this.clients.can(sid, 0)) {
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
        this.sync.scheduleFullGlobalSync();
      }

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onRateHack: (sid : string, data : e.RateHack) => {
      if (!this.clients.can(sid, data.judgeId)) {
        return Promise.resolve({
          success: false,
          message: "You don't have permission to do that"
        });
      }

      if (this.db.getCategoriesCount() !== data.ratings.length) {
        return Promise.resolve({
          success: false,
          message: "Wrong number of ratings"
        });
      }

      for (let i=0;i<data.ratings.length;i++) {
        this.db.changeRating({
          judgeId: data.judgeId,
          categoryId: i+1,
          hackId: data.hackId,
          rating: data.ratings[i]
        });
      }

      this.sync.scheduleFullJudgeSync(data.judgeId);
      this.sync.scheduleFullGlobalSync();

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onRankSuperlative: (sid : string, data : e.RankSuperlative) => {
      if (!this.clients.can(sid, data.judgeId)) {
        return Promise.resolve({
          success: false,
          message: "You can't do that."
        });
      }

      this.db.changeSuperlativePlacement(data);

      this.sync.scheduleFullJudgeSync(data.judgeId);
      this.sync.scheduleFullGlobalSync();

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onSetJudgeHackPriority: (sid: string, data: e.SetJudgeHackPriority) => {
      if (!this.clients.can(sid, 0)) {
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
        this.sync.scheduleFullJudgeSync(data.judgeId);
        this.sync.scheduleFullGlobalSync();
      });

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onSetSynchronizeGlobal: (sid: string, data: e.SetSynchronizeGlobal) => {
      this.sync.sendGlobalSync(sid);

      let clientState = this.clients.getClientState(sid);
      clientState.syncGlobal = data.syncShared;
      this.clients.setClientState(sid, clientState);

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

    onSetSynchronizeJudge: (sid: string, data: e.SetSynchronizeJudge) => {
      if (!this.clients.can(sid, data.judgeId)) {
        return Promise.resolve({
          success: false,
          message: "You can't see hacks of judges your not privileged as."
        });
      }

      let clientState = this.clients.getClientState(sid);
      if (data.syncMyHacks) {
        clientState.syncJudge = data.judgeId;
      } else {
        clientState.syncJudge = 0;
      }
      this.clients.setClientState(sid, clientState);

      this.sync.sendJudgeSync(sid);

      return Promise.resolve({
        success: true,
        message: "success"
      });
    },

  }

  private getSyncSharedData(): e.SynchronizeGlobal {
    return {
      isFull: true,

      hacks: this.db.getAllHacks(),
      judges: this.db.getAllJudges(),
      superlatives: this.db.getAllSuperlatives(),
      superlativeHacks: this.db.getAllSuperlativeHacks(),
      categories: this.db.getAllCategories(),

      judgeHackMatrix: this.db.getJudgeHackMatrix()
    };
  }

  private dispatchSyncTo(data: e.SynchronizeGlobal, admin: boolean, sid: string) {
    let dataForClient : e.SynchronizeGlobal;
    if (admin) {
      dataForClient = data;
    } else {
      dataForClient = {
        isFull: true,

        hacks: data.hacks,
        judges: data.judges,
        superlatives: data.superlatives,
        superlativeHacks: data.superlativeHacks,
        categories: data.categories
      };
    }

    this.events.sendSynchronizeGlobal(sid, dataForClient);
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
    if (this.clients.can(sid, testPrivilege)) {
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
    if (this.clients.can(sid, 0)) {
      let result = action();
      this.sync.scheduleFullGlobalSync();
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
