import {Server} from "http";
import {
  default as socketio,
  Server as SioServer,
  Socket as SioSocket
} from "socket.io";
import {Validator, ValidatorResult} from "jsonschema";

import {
  EventClass,
  EventType,
  EventMeta,
  eventMetas,

  ProtocolError,
  SynchronizeGlobal,
  SynchronizeJudge
} from "../protocol/events.js";

/**
 * Wrap Socketio
 */
export class Socket {
  private validator: Validator;
  private sio: SioServer;
  private onConnectHandler: ConnectHandler;
  private handlers: Map<string, [EventMeta, RequestHandler]>;

  constructor(private server: Server) {
    this.validator = new Validator();
    this.sio = socketio(server);
    this.onConnectHandler = sid => {};
    this.handlers = new Map();

    for (let eventMeta of eventMetas) {
      if (eventMeta.eventClass === EventClass.Request) {
        this.handlers.set(eventMeta.eventType, [
          eventMeta,
          (sid, d) => this.handleUnhandledRequest(eventMeta.eventType, sid, d),
        ]);
      }
    }

    this.sio.on("connect", s => {
      this.handlers.forEach((v,k) => {
        this.registerRequestHandler(s, v[0], v[1]);
      });
    });
  }

  private handleUnhandledRequest(name: string, sid: string, data: object): Promise<null> {
    this.sendProtocolError(sid, {
      eventName: name,
      message: "We don't have a handler for this event yet",
      original: data
    });

    return Promise.resolve(null);
  }

  private registerRequestHandler(socket: SioSocket, meta: EventMeta, handler: RequestHandler) {
    socket.on(meta.eventType, data => {
      if (meta.eventClass !== EventClass.Request) {
        throw new Error("Not a request handler");
      }

      // Ensure request matches schema
      let val = this.validator.validate(data, meta.schema);
      if (val.errors.length > 0) {
        this.sendProtocolError(socket.id, {
          eventName: meta.eventType,
          message: this.getFailedValidationMessage(meta.eventType, val),
          original: data
        });

        return;
      }

      // Run handler and, if there's a response, send it
      handler(socket.id, data).then((response: object) => {
        if (response != null) {
          this.sio.to(socket.id).emit(meta.response, {
            ...response, returnId: data.returnId
          });
        }
      });
    });
  }

  private getFailedValidationMessage(eventName : string, val : ValidatorResult) : string {
    let message = `You sent a malformed ${eventName} request.\n`;
    for (let err of val.errors) {
      message += ` - ${err.message}\n`;
    }
    return message;
  }

  onConnect(handler: ConnectHandler) {
    this.onConnectHandler = handler;
  }

  setHandler(name: EventType, handler: RequestHandler) {
    if (!this.handlers.has(name)) {
      throw new Error(`Refusing to add handler for ${name}, seemingly invalid`);
    } else {
      let old = this.handlers.get(name);
      this.handlers.set(name, [old[0], handler]);
    }
  }

  sendProtocolError(room : string, protocolError: ProtocolError) {
    this.sio.to(room).emit("ProtocolError", protocolError);
  }

  sendSynchronizeGlobal(room: string, synchronizeGlobal: SynchronizeGlobal) {
    this.sio.to(room).emit("SynchronizeGlobal", synchronizeGlobal);
  }

  sendSynchronizeJudge(room: string, synchronizeJudge: SynchronizeJudge) {
    this.sio.to(room).emit("SynchronizeJudge", synchronizeJudge);
  }
}

export type RequestHandler = (sid: string, data: object) => Promise<object | null>;
export type ConnectHandler = (sid: string) => void;
