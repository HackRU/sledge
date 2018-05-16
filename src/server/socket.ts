import socketio     from "socket.io";
import jsonschema   from "jsonschema";

import * as persistence from "./persistence";
import * as protocol   from "../protocol/protocol";

export class SocketCommunication {
    sio : socketio.Server;
    db : persistence.DatabaseConnection;
    validator : jsonschema.Validator;

    constructor(server, db) {
        let sio = socketio(server);
        this.sio = sio;

        this.db = db;

        let validator = new jsonschema.Validator();
        this.validator = validator;

        sio.on("connect", this.handleConnect.bind(this));
    }

    handleConnect(socket) {
        let secret = socket.handshake.query.secret;

        // TODO: Reject request based on secret

        this.addTransientHandler(socket, "rank-superlative", this.handleRankSuperlative.bind(this));
        this.addTransientHandler(socket, "add-judge", this.handleRankSuperlative.bind(this));
        this.addTransientHandler(socket, "add-hack", this.handleRankSuperlative.bind(this));

        socket.emit("update-full", this.db.getSerialized());
    }

    addTransientHandler(socket, evt, handler) {
        socket.on(evt, function (data) {
            let validationErrors = protocol.validate(evt, data);
            if ( validationErrors.length > 0 ) {
                console.warn("Got validation errors from \"%s\" event!", evt);
                for ( let err of validationErrors ) {
                    console.log(" - %s", err.message);
                }
                socket.emit("transient-response", {
                    original: evt,
                    success: false,
                    message: "Data did not match schema (see server logs)",
                });
            } else {
                let result = handler(socket, data);
                socket.emit("transient-response", {
                    original: evt,
                    success: !result,
                    message: result || "Success!"
                });
            }
        });
    }

    handleRankSuperlative(socket, data) : string | null {
        let placement : persistence.SuperlativePlacement = {
            judgeId: data.judgeId,
            superlativeId: data.superId,
            firstChoiceId: data.firstId,
            secondChoiceId: data.secondChoiceId
        };
        this.db.addSueprlativePlacement(placement);
        this.sendFullUpdate();
        return null;
    }

    handleAddJudge(socket, data) : string | null {
        let judge : persistence.Judge = data;

        this.db.addJudge(data);
        this.sendFullUpdate();
        return null;
    }

    handleAddHack(socket, data) : string | null {
        let hack : persistence.Hack = data;

        this.db.addHack(data);
        this.sendFullUpdate();
        return null;
    }

    handleRateHack(socket, data) : string | null {
        let rating : persistence.Rating = data;

        this.db.addRating(rating);
        this.sendFullUpdate();

        return null;
    }

    handleAddSuperlative(socket, data) : string | null {
        return null;
    }

    handleAddToken(socket, data) : string | null {
        return null;
    }

    handleAllocateJudges(socket, data) : string | null {
        return null;
    }

    sendFullUpdate() {
        this.sio.emit("update-full", this.db.getSerialized());
    }
};
