import {Server, Socket} from "socket.io";
import jsonschema from "jsonschema";

import {
  Request, AddHack, AddJudge, AddSuperlative, Authenticate, Login, RateHack,
  RankSuperlative, SetSynchronize,

  Response, AuthenticateResponse, GenericResponse, LoginResponse,

  ProtocolError, Synchronize
} from "lib/protocol/events";
import * as evts from "lib/protocol/events";

/**
 * This class acts a wrapper around SocketIO events providing:
 *  - Type checking and validation
 *  - Request/Response handling with promises
 */
export class ServerEventWrapper {
  private validator : jsonschema.Validator;

  constructor(private sio : Server, private handlers : ServerEventHandlers) {
    this.validator = new jsonschema.Validator();

    let h = handlers;
    let reg = this.registerRequestHandler;
    sio.on("connect", s => {
      reg(s, "AddHack", "GenericResponse", evts.addHack, h.onAddHack);
      reg(s, "AddJudge", "GenericResponse", evts.addJudge, h.onAddJudge);
      reg(s, "AddSuperlative", "GenericResponse", evts.addSuperlative,
        h.onAddSuperlative);
      reg(s, "Authenticate", "AuthenticateResponse", evts.authenticate,
        h.onAuthenticate);
      reg(s, "Login", "LoginResponse", evts.login, h.onLogin);
      reg(s, "RateHack", "GenericResponse", evts.rateHack, h.onRateHack);
      reg(s, "RankSuperlative", "GenericResponse", evts.rankSuperlative,
        h.onRankSuperlative);
      reg(s, "SetSynchronize", "GenericResponse", evts.setSynchronize,
        h.onSetSynchronize);
    });
  };

  private registerRequestHandler = <E extends Request, R extends Response>(
    socket:Socket, evt:string, res:string, schema:any, handler:RequestHandler<E,R>
  ) => {
    socket.on(evt, data => {
      let val = this.validator.validate(data, schema);
      if (val.errors.length > 0) {
        let message = "You sent a malformed \"" + evt + "\" request.\n";
        for (let err of val.errors) {
          message = message + " - " + err.message + "\n";
        }

        this.sendProtocolError(socket.id, {
          eventName: evt,
          message: message,
          original: data
        });
      } else {
        handler(socket.id, data).then((response) => {
          let unsafeResponse = response as any;
          this.sio.emit(res, {
            ...unsafeResponse, returnId: data.returnId
          });
        });
      }
    });
  }

  sendProtocolError(room : string, protocolError : ProtocolError) {
    this.sio.to(room).emit("ProtocolError", protocolError);
  }

  sendSynchronize(room : string, synchronize : Synchronize) {
    this.sio.to(room).emit("Synchronize", synchronize);
  }
};

export interface ServerEventHandlers {
  onAddHack : RequestHandler<AddHack, GenericResponse>;
  onAddJudge : RequestHandler<AddJudge, GenericResponse>;
  onAddSuperlative : RequestHandler<AddSuperlative, GenericResponse>;
  onAuthenticate : RequestHandler<Authenticate, AuthenticateResponse>;
  onLogin : RequestHandler<Login, LoginResponse>;
  onRateHack : RequestHandler<RateHack, GenericResponse>;
  onRankSuperlative : RequestHandler<RateHack, GenericResponse>;
  onSetSynchronize : RequestHandler<SetSynchronize, GenericResponse>;
};

/*
 * A RequestHandler<Event, Response> takes the socket id and event and returns a
 * promise which will be used to respond. The returnId of the response returned
 * by the promise will be overwritten before sending.
 */
export type RequestHandler<E extends Request, R extends Response> =
  (sid:string, e:E) => Promise<R>;
