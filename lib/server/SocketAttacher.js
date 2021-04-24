"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAttacher = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const log_1 = require("./log");
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
class SocketAttacher {
    constructor(server) {
        this.sio = socket_io_1.default(server);
        this.sio.on("connect", (s) => this.connectHandler(s));
    }
    setRequestHandler(newHandler) {
        this.requestHandler = newHandler;
    }
    connectHandler(socket) {
        socket.on("request", (data) => {
            if (typeof data !== "object") {
                log_1.log(`WARN: Got request event with type ${typeof data}. Ignoring.`);
                return;
            }
            if (!this.requestHandler) {
                throw new Error("No request handler!");
            }
            this.requestHandler(data, socket.sid);
        });
    }
    sendUpdate(data) {
        this.sio.emit("update", data);
    }
    sendResponse(data, client) {
        if (!client) {
            this.sio.emit("response", data);
        }
        else {
            this.sio.to(client).emit("response", data);
        }
    }
}
exports.SocketAttacher = SocketAttacher;
//# sourceMappingURL=SocketAttacher.js.map