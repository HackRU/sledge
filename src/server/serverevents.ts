import {Server, Socket}     from "socket.io";
import jsonschema           from "jsonschema";

import * as evts    from "../protocol/events";

export class ServerEventWrapper {
  private validator : jsonschema.Validator;

  constructor(private sio : Server, private handlers : ServerEventHandlers) {
    this.validator = new jsonschema.Validator();

    sio.on("connect", s => {
      this.registerHandler(s, "add-hack",
        evts.addHackSchema, this.handlers.addHackHandler);
      this.registerHandler(s, "add-judge",
        evts.addJudgeSchema, this.handlers.addJudgeHandler);
      this.registerHandler(s, "add-superlative",
        evts.addSuperlativeSchema, this.handlers.addSuperlativeHandler);
      this.registerHandler(s, "rank-superlative",
        evts.rankSuperlativeSchema, this.handlers.rankSuperlativeHandler);
      this.registerHandler(s, "rate-hack",
        evts.rateHackSchema, this.handlers.rateHackHandler);
    });
  };

  registerHandler(socket:Socket, evt:string, schema:any, handler:(s:Socket,d:any)=>void) {
    socket.on(evt, data => {
      let val = this.validator.validate(data, schema);
      if (val.errors.length > 0) {
        let message = "You send a malformed \"" + evt + "\" request.\n";
        for (let err of val.errors) {
          message = message + " - " + err.message + "\n";
        }
        this.emitProtocolError(socket.id, {
          original: evt,
          message: message
        });
      } else {
        handler.call(null, socket, data);
      }
    });
  }

  emitProtocolError(room:string, data : evts.ProtocolError) {
    this.sio.to(room).emit("protocol-error", data);
  }
};

export interface ServerEventHandlers {
  addHackHandler : (s:Socket,e:evts.AddHack) => void;
  addJudgeHandler : (s:Socket,e:evts.AddJudge) => void;
  addSuperlativeHandler : (s:Socket,e:evts.AddSuperlative) => void;
  rankSuperlativeHandler : (s:Socket,e:evts.RankSuperlative) => void;
  rateHackHandler : (s:Socket,e:evts.RateHack) => void;
};
