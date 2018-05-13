import socketio from "socket.io";

export class SocketCommunication {
    sio : socketio.Server;

    constructor(server) {
        let sio = socketio(server);
        this.sio = sio;

        sio.on("connect", function (sid, env) {
            console.log("xx");
        });
    }
};
