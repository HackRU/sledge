import http         from "http";
import jsonschema   from "jsonschema";
import socketio     from "socket.io";

import * as evts            from "../protocol/events";
import {DatabaseConnection} from "./persistence";
import {ServerEventWrapper} from "./serverevents";

export class SocketCommunication {
  private sio : socketio.Server;
  private events : ServerEventWrapper;

  constructor(private server : http.Server, private db : DatabaseConnection) {
    this.sio = socketio(server);

    let handlers = {
      addHackHandler: (s,d) => this.handleAddHack(s,d),
      addJudgeHandler: (s,d) => this.handleAddJudge(s,d),
      addSuperlativeHandler: (s,d) => this.handleAddSuperlative(s,d),
      rankSuperlativeHandler: (s,d) => this.handleRankSuperlative(s,d),
      rateHackHandler: (s,d) => this.handleRateHack(s,d)
    };
    this.events = new ServerEventWrapper(this.sio, handlers);
  }

  handleAddHack(s : socketio.Socket, data : evts.AddHack) {
    this.db.addHack(data);
    this.sendFullUpdate();
  }

  handleAddJudge(s : socketio.Socket, data : evts.AddJudge) {
    this.db.addJudge(data);
    this.sendFullUpdate();
  }

  handleAddSuperlative(s : socketio.Socket, data : evts.AddSuperlative) {
    throw new Error("NYI");
  }

  handleRankSuperlative(s : socketio.Socket, data : evts.RankSuperlative) {
    let placement = {
        judgeId: data.judgeId,
        superlativeId: data.superId,
        firstChoiceId: data.firstId,
        secondChoiceId: data.secondId
    };
    this.db.addSuperlativePlacement(placement);
    this.sendFullUpdate();
  }

  handleRateHack(s : socketio.Socket, data : evts.RateHack) {
    this.db.addRating(data);
    this.sendFullUpdate();
  }

  sendFullUpdate() {
    this.sio.emit("update-full", this.db.getSerialized());
  }
};
