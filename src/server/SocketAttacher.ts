import {Server as HttpServer} from "http";
import socketio from "socket.io";

import {log} from "./log";

export type RecieveHandler = (data: object) => Promise<object>;

/**
 * Set up a socket that can communicate with the client, whereas a socket just
 * lets us pass json objects back and forth. We use socket.io, but using this
 * class in between should make it easy to switch to anything else.
 *
 * We split up events into three types and leave additional metadata up to the
 * handler. Requests are sent from client to server and each request elicits a
 * response, sent from server to client, sent to only the one client. Updates
 * are server to client and are always sent to everyone.
 */
export class SocketAttacher {
  private sio: any;
  private requestHandler?: (data: object, client: string) => void;

  constructor(server: HttpServer) {
    this.sio = socketio(server);
    this.sio.on("connect", (s: any) => this.connectHandler(s));
  }

  setRequestHandler(newHandler: (data: object, client: string) => void) {
    this.requestHandler = newHandler;
  }

  connectHandler(socket: any) {
    socket.on("request", (data: any) => {
      if (typeof data !== "object") {
        log(`WARN: Got request event with type ${typeof data}. Ignoring.`);
        return;
      }

      if (!this.requestHandler) {
        throw new Error("No request handler!");
      }

      this.requestHandler(data, socket.sid);
    });
  }

  sendUpdate(data: object) {
    this.sio.emit("update",  data);
  }

  sendResponse(data: object, client: string) {
    if (!client) {
      this.sio.emit("response", data);
    } else {
      this.sio.to(client).emit("response", data);
    }
  }
}
