import http                                   from "http";
import jsonschema                             from "jsonschema";
import {default as socketio, Server, Socket}  from "socket.io";

import * as evts                from "lib/protocol/events";
import {DatabaseConnection}     from "./persistence";
import {ServerEventWrapper}     from "./serverevents";
import {AuthenticationManager}  from "./authentication";

export class SocketCommunication {
  private sio : Server;
  private events : ServerEventWrapper;
  private auth : AuthenticationManager;

  constructor(private server : http.Server, private db : DatabaseConnection) {
    this.sio = socketio(server);

    let handlers = {
      connectHandler: this.handleConnect,

      addHackHandler: this.handleAddHack,
      addJudgeHandler: this.handleAddJudge,
      addSuperlativeHandler: this.handleAddSuperlative,
      authenticateHandler: this.handleAuthenticate,
      loginHandler: this.handleLogin,
      rankSuperlativeHandler: this.handleRankSuperlative,
      rateHackHandler: this.handleRateHack,
      subscribeDatabaseHandler: this.handleSubscribeDatabase
    };
    this.events = new ServerEventWrapper(this.sio, handlers);

    this.auth = new AuthenticationManager(db);
  }

  public handleConnect = (s : Socket) => {
    this.auth.registerClient(s.id);
  }

  public handleAddHack = (s : Socket, data : evts.AddHack) => {
    this.db.addHack(data);
    this.sendFullUpdate();

    this.events.emitTransientResponse(s.id, {
      original: "add-hack",
      message: "success"
    });
  }

  public handleAddJudge = (s : Socket, data : evts.AddJudge) => {
    this.db.addJudge(data);
    this.sendFullUpdate();
  }

  public handleAddSuperlative = (s : Socket, data : evts.AddSuperlative) => {
    this.events.emitProtocolError(s.id, {
      original: "add-superlative",
      message: "Not Yet Implemented"
    });
  }

  public handleAuthenticate = (s : Socket, data : evts.Authenticate) => {
    // TODO: Check if they have permission to authenticate
    this.auth.setUserId(s.id, data.userId);
    this.events.emitAuthenticateResponse(s.id, {
      success: true,
      userId: data.userId,
      judgeId: data.userId>0 ? data.userId : 0
    });
  }

  public handleLogin = (s : Socket, data : evts.Login) => {
    this.events.emitProtocolError(s.id, {
      original: "handle-login",
      message: "Not Yet Implemented"
    });
  }

  public handleRankSuperlative = (s : Socket, data : evts.RankSuperlative) => {
    let placement = {
        judgeId: data.judgeId,
        superlativeId: data.superId,
        firstChoiceId: data.firstId,
        secondChoiceId: data.secondId
    };
    this.db.addSuperlativePlacement(placement);
    this.sendFullUpdate();

    this.events.emitTransientResponse(s.id, {
      original: "rank-superlative",
      message: "success"
    });
  }

  public handleRateHack = (s : Socket, data : evts.RateHack) => {
    this.db.addRating(data);
    this.sendFullUpdate();

    this.events.emitTransientResponse(s.id, {
      original: "rate-hack",
      message: "success"
    });
  }

  public handleSubscribeDatabase = (s : Socket, data : evts.SubscribeDatabase) => {
    if (!this.auth.hasPermission(s.id, 0)) {
      this.events.emitProtocolError(s.id, {
        original: "subscribe-database",
        message: "You must be authenticated to use subscribe-database"
      });
    }

    s.join("database-updates");
    this.sendFullUpdate(s.id);
  }

  sendFullUpdate(room = "database-updates") {
    this.events.emitUpdateFull(room, {
      database: this.db.getSerialized()
    });
  }
};
