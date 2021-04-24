"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSocket = void 0;
class ServerSocket {
    constructor(socketAttacher) {
        this.socketAttacher = socketAttacher;
        socketAttacher.setRequestHandler((data, client) => this.handleRequest(data, client));
    }
    bindRequestHandler(requestHandler) {
        if (typeof this.requestHandler !== "undefined") {
            throw new Error("A request handler may only be bound once.");
        }
        this.requestHandler = requestHandler;
    }
    sendUpdate(data) {
        this.socketAttacher.sendUpdate(data);
    }
    handleRequest(data, client) {
        if (typeof this.requestHandler === "undefined") {
            throw new Error("Recieved request before requestHandler bound.");
        }
        this.requestHandler(data).then(response => {
            this.socketAttacher.sendResponse(Object.assign({ returnId: data["returnId"] }, response), client);
        });
    }
}
exports.ServerSocket = ServerSocket;
//# sourceMappingURL=ServerSocket.js.map