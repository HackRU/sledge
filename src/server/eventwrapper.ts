import {Server, Socket} from "socket.io";
import {Validator, ValidatorResult} from "jsonschema";

import * as e from "../protocol/events.js";

/**
 * This class acts a wrapper around SocketIO events providing:
 *  - Type checking and validation
 *  - Request/Response handling with promises
 */
export class ServerEventWrapper {
  private validator : Validator;

  constructor(private sio : Server, private handlers : ServerEventHandlers) {
    this.validator = new Validator();

    let h = handlers;
    let reg = this.registerRequestHandler;
    sio.on("connect", s => {
      reg(s, e.addCategory, h.onAddCategory);
      reg(s, e.addHack, h.onAddHack);
      reg(s, e.addJudge, h.onAddJudge);
      reg(s, e.addSuperlative, h.onAddSuperlative);
      reg(s, e.authenticate, h.onAuthenticate);
      reg(s, e.login, h.onLogin);
      reg(s, e.rateHack, h.onRateHack);
      reg(s, e.rankSuperlative, h.onRankSuperlative);
      reg(s, e.setSynchronize, h.onSetSynchronize);
      s.on("disconnect", h.onDisconnect);

      h.onConnect(s.id);
    });
  };

  private registerRequestHandler = <E extends e.Request, R extends e.Response>(
    socket:Socket, meta:e.RequestMeta, handler:RequestHandler<E,R>
  ) => {
    socket.on(meta.name, data => {
      // Ensure request matches schema
      if (meta.schema) {
        let val = this.validator.validate(data, meta.schema);
        if (val.errors.length > 0) {
          this.sendProtocolError(socket.id, {
            eventName: meta.name,
            message: this.getFailedValidationMessage(meta.name, val),
            original: data
          });

          return;
        }
      }

      handler(socket.id, data).then((response:any) => {
        this.sio.to(socket.id).emit(meta.response, {
          ...response, returnId: data.returnId
        });
      });
    });
  }

  getFailedValidationMessage(eventName : string, val : ValidatorResult) : string {
    let message = `You sent a malformed ${eventName} request.\n`;
    for (let err of val.errors) {
      message += ` - ${err.message}\n`;
    }
    return message;
  }

  sendProtocolError(room : string, protocolError : e.ProtocolError) {
    this.sio.to(room).emit("ProtocolError", protocolError);
  }

  sendSynchronize(room : string, synchronize : e.Synchronize) {
    this.sio.to(room).emit("Synchronize", synchronize);
  }
}

export interface ServerEventHandlers {
  onConnect : (sid : string) => void;
  onDisconnect : (sid : string) => void;

  onAddCategory: RequestHandler<e.AddCategory, e.AddRowResponse>;
  onAddHack : RequestHandler<e.AddHack, e.AddRowResponse>;
  onAddJudge : RequestHandler<e.AddJudge, e.AddRowResponse>;
  onAddSuperlative : RequestHandler<e.AddSuperlative, e.AddRowResponse>;
  onAuthenticate : RequestHandler<e.Authenticate, e.AuthenticateResponse>;
  onLogin : RequestHandler<e.Login, e.LoginResponse>;
  onRateHack : RequestHandler<e.RateHack, e.GenericResponse>;
  onRankSuperlative : RequestHandler<e.RankSuperlative, e.GenericResponse>;
  onSetSynchronize : RequestHandler<e.SetSynchronize, e.GenericResponse>;
}

/*
 * A RequestHandler<Event, Response> takes the socket id and event and returns a
 * promise which will be used to respond. The returnId of the response returned
 * by the promise will be overwritten before sending.
 */
export type RequestHandler<E extends e.Request, R extends e.Response> =
  (sid:string, ev:E) => Promise<R>;
