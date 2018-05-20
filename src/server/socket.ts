import http                                   from "http";
import jsonschema                             from "jsonschema";
import {default as socketio, Server, Socket}  from "socket.io";

import * as evts            from "../protocol/events";
import {DatabaseConnection} from "./persistence";
import {ServerEventWrapper} from "./serverevents";

export class SocketCommunication {
  private sio : Server;
  private events : ServerEventWrapper;

  constructor(private server : http.Server, private db : DatabaseConnection) {
    this.sio = socketio(server);

    let handlers = {
      addHackHandler: this.handleAddHack,
      addJudgeHandler: this.handleAddJudge,
      addSuperlativeHandler: this.handleAddSuperlative,
      authenticateHandler : this.handleAuthenticate,
      loginHandler : this.handleLogin,
      rankSuperlativeHandler: this.handleRankSuperlative,
      rateHackHandler: this.handleRateHack,
      subscribeDatabaseHandler : this.handleSubscribeDatabase
    };
    this.events = new ServerEventWrapper(this.sio, handlers);
  }

  public handleAddHack = (s : Socket, data : evts.AddHack) => {
    this.db.addHack(data);
    this.sendFullUpdate();
  }

  public handleAddJudge = (s : Socket, data : evts.AddJudge) => {
    this.db.addJudge(data);
    this.sendFullUpdate();
  }

  public handleAddSuperlative = (s : Socket, data : evts.AddSuperlative) => {
    throw new Error("NYI");
  }

  public handleAuthenticate = (s : Socket, data : evts.Authenticate) => {
    throw new Error("NYI");
  }

  public handleLogin = (s : Socket, data : evts.Login) => {
    throw new Error("NYI");
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
  }

  public handleRateHack = (s : Socket, data : evts.RateHack) => {
    this.db.addRating(data);
    this.sendFullUpdate();
  }

  public handleSubscribeDatabase = (s : Socket, data : evts.SubscribeDatabase) => {
    throw new Error("NYI");
  }

  sendFullUpdate() {
    this.sio.emit("update-full", this.db.getSerialized());
  }
};
