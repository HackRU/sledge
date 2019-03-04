import uuidv4 from "uuid";

import {
  EventType,

  AddRow, Authenticate, Login, ModifyRow, RateHack, RankSuperlative, SetJudgeHackPriority,
  SetSynchronizeGlobal, SetSynchronizeJudge,

  AddRowResponse, AuthenticateResponse, GenericResponse, LoginResponse
} from "../protocol/events";

import {
  Table
} from "../protocol/database";

import {Socket} from "./Socket";
import {DatabaseConnection} from "./DatabaseConnection";
import {ClientStore} from "./ClientStore";
import {SyncManager} from "./SyncManager";

/**
  Handles incoming events
 */
export class EventHandler {
  private clients: ClientStore;
  private sync: SyncManager;

  constructor(private socket: Socket, private db : DatabaseConnection) {
    this.clients = new ClientStore();
    this.sync = new SyncManager(this.socket, this.db, this.clients);

    socket.onConnect(sid => this.doConnect(sid));
    socket.setHandler(EventType.AddRow, (s,d:any) => this.doAddRow(s,d));
    socket.setHandler(EventType.Authenticate, (s,d:any) => this.doAuthenticate(s,d));
    socket.setHandler(EventType.Login, (s,d:any) => this.doLogin(s,d));
    socket.setHandler(EventType.ModifyRow, (s,d:any) => this.doModifyRow(s,d));
    socket.setHandler(EventType.RankSuperlative, (s,d:any) => this.doRankSuperlative(s,d));
    socket.setHandler(EventType.RateHack, (s,d:any) => this.doRateHack(s,d));
    socket.setHandler(EventType.SetJudgeHackPriority, (s,d:any) => this.doSetJudgeHackPriority(s,d));
    socket.setHandler(EventType.SetSynchronizeGlobal, (s,d:any) => this.doSetSynchronizeGlobal(s,d));
    socket.setHandler(EventType.SetSynchronizeJudge, (s,d:any) => this.doSetSynchronizeJudge(s,d));
  }

  doConnect(sid: string) {
    this.clients.registerClient(sid);
  }

  doAddRow(sid: string, data: AddRow): Promise<AddRowResponse> {
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
  }

  doAuthenticate(sid: string, data: Authenticate): Promise<AuthenticateResponse> {
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
        privilege: this.clients.getClientState(sid).privilege
      });
    }
  }

  doLogin(sid: string, data: Login): Promise<LoginResponse> {
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
  }

  doModifyRow(sid: string, data: ModifyRow): Promise<GenericResponse> {
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
  }

  doRateHack(sid : string, data : RateHack): Promise<GenericResponse> {
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
  }

  doRankSuperlative(sid: string, data: RankSuperlative): Promise<GenericResponse> {
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
  }

  doSetJudgeHackPriority(sid: string, data: SetJudgeHackPriority): Promise<GenericResponse> {
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
  }

  doSetSynchronizeGlobal(sid: string, data: SetSynchronizeGlobal): Promise<GenericResponse> {
    this.sync.sendGlobalSync(sid);

    let clientState = this.clients.getClientState(sid);
    clientState.syncGlobal = data.syncShared;
    this.clients.setClientState(sid, clientState);

    return Promise.resolve({
      success: true,
      message: "success"
    });
  }

  doSetSynchronizeJudge(sid: string, data: SetSynchronizeJudge): Promise<GenericResponse> {
    if (!this.clients.can(sid, data.judgeId)) {
      return Promise.resolve({
        success: false,
        message: "You can't see hacks of judges you're not privileged as."
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
  }
}
