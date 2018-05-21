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
      this.registerHandler(s, "authenticate",
        evts.authenticateSchema, this.handlers.authenticateHandler);
      this.registerHandler(s, "login",
        evts.loginSchema, this.handlers.loginHandler);
      this.registerHandler(s, "rank-superlative",
        evts.rankSuperlativeSchema, this.handlers.rankSuperlativeHandler);
      this.registerHandler(s, "rate-hack",
        evts.rateHackSchema, this.handlers.rateHackHandler);
      this.registerHandler(s, "subscribe-database",
        evts.subscribeDatabaseSchema, this.handlers.subscribeDatabaseHandler);

      this.handlers.connectHandler(s);
    });
  };

  registerHandler(socket:Socket, evt:string, schema:any, handler:(s:Socket,d:any)=>void) {
    socket.on(evt, data => {
      let val = this.validator.validate(data, schema);
      if (val.errors.length > 0) {
        let message = "You sent a malformed \"" + evt + "\" request.\n";
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

  emitAuthenticateResponse(room : string, data : evts.AuthenticateResponse) {
    this.sio.to(room).emit("authenticate-response", data);
  }

  emitLoginResponse(room : string, data : evts.LoginResponse) {
    this.sio.to(room).emit("login-response", data);
  }

  emitProtocolError(room : string, data : evts.ProtocolError) {
    this.sio.to(room).emit("protocol-error", data);
  }

  emitUpdateFull(room : string, data : evts.UpdateFull) {
    this.sio.to(room).emit("update-full", data);
  }

  emitUpdatePartial(room : string, data : evts.UpdatePartial) {
    this.sio.to(room).emit("update-partial", data);
  }
};

export interface ServerEventHandlers {
  connectHandler : (s:Socket) => void;

  addHackHandler : (s:Socket,e:evts.AddHack) => void;
  addJudgeHandler : (s:Socket,e:evts.AddJudge) => void;
  addSuperlativeHandler : (s:Socket,e:evts.AddSuperlative) => void;
  authenticateHandler : (s:Socket,e:evts.Authenticate) => void;
  loginHandler : (s:Socket,e:evts.Login) => void;
  rateHackHandler : (s:Socket,e:evts.RateHack) => void;
  rankSuperlativeHandler : (s:Socket,e:evts.RankSuperlative) => void;
  subscribeDatabaseHandler : (s:Socket,e:evts.SubscribeDatabase) => void;
};
