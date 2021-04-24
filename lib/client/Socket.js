"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = exports.Socket = void 0;
const socket_io_client_1 = __importDefault(require("socket.io-client"));
/**
 * The socket singleton
 */
let singleton;
/**
 * Communicates with the Sledge server
 */
class Socket {
    constructor() {
        this.updateHandlers = [];
        this.connectionHandlers = [];
        this.resolvers = new Map();
        this.socket = socket_io_client_1.default(document.location.origin, {
            reconnectionAttempts: 3,
            reconnectionDelay: 2000
        });
        this.socket.on("update", (data) => this.handleUpdate(data));
        this.socket.on("response", (data) => this.handleResponse(data));
        [
            "connect",
            "connect_error",
            "connect_timeout",
            "error",
            "disconnect",
            "reconnect",
            "reconnect_attempt",
            "reconnecting",
            "reconnect_error",
            "reconnect_failed"
        ].forEach(evtName => this.socket.on(evtName, () => this.handleConnection(evtName)));
    }
    handleUpdate(data) {
        for (let h of this.updateHandlers) {
            h(data);
        }
    }
    handleConnection(eventName) {
        for (let h of this.connectionHandlers) {
            h(eventName);
        }
    }
    handleResponse(data) {
        let returnId = data["returnId"];
        let resolver = this.resolvers.get(returnId);
        if (resolver) {
            if (data["error"]) {
                console.error(`Response gave error: ${data["error"]}`);
            }
            resolver(data);
            this.resolvers.delete(returnId);
        }
    }
    /**
     * Sends a request to the server and returns a Promise giving
     * the response. Before sending the returnId is set.
     */
    sendRequest(data) {
        let returnId = generateUniqueReturnId();
        let wireData = Object.assign(Object.assign({}, data), { returnId });
        this.socket.emit("request", wireData);
        return new Promise(resolve => {
            this.resolvers.set(returnId, resolve);
        });
    }
    sendDebug(data) {
        let beforeTime = Date.now();
        let promise = this.sendRequest(data);
        promise.then(res => {
            let diffTime = Date.now() - beforeTime;
            console.log(`Got response after ${diffTime / 1000} seconds!`);
            console.log(res);
        });
        return promise;
    }
    onUpdate(handler) {
        this.updateHandlers.push(handler);
    }
    onConnectionEvent(handler) {
        this.connectionHandlers.push(handler);
    }
}
exports.Socket = Socket;
/**
 * Gets the socket singleton instance
 */
function getSocket() {
    if (!singleton) {
        singleton = new Socket();
    }
    return singleton;
}
exports.getSocket = getSocket;
/**
 * Generates a unique string used as the returnId of a request.
 *
 * This is a combination of time and randomness.
 */
function generateUniqueReturnId() {
    let timePart = Date.now().toString(16).slice(-6);
    let randomPart = Math.random().toString(16).slice(-6);
    return timePart + randomPart;
}
//# sourceMappingURL=Socket.js.map