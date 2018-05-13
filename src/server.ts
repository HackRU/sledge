import express  from "express";
import http     from "http";
import path     from "path";

import * as persistence from "./persistence";
import * as socket      from "./socket";

let port = 8080;

let staticdir = path.resolve(__dirname, "../static");
let datadir = path.resolve(__dirname, "../data");


export function main(argv) {
    console.log("Static Directory: %s", staticdir);
    console.log("Data Directory: %s", datadir);

    let db = new persistence.DatabaseConnection(datadir);
    let app = express();
    let server = new http.Server(app);
    let sockcomm = new socket.SocketCommunication(server);


    app.use(express.static("static"));
    server.listen(port);
    console.log(`Running at http://localhost:${port}`);
}
