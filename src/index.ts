import express  from "express";
import http     from "http";
import path     from "path";

import * as persistence from "./server/persistence";
import * as socket      from "./server/socket";

let port = 8080;

let publicdir = path.resolve(__dirname, "../public");
let distdir = path.resolve(__dirname, "../dist");
let datadir = path.resolve(process.cwd(), "data");


export function start() {
  console.log("Public Directory: %s", publicdir);
  console.log("Distribution Directory: %s", distdir);
  console.log("Data Directory: %s", datadir);

  let db = new persistence.DatabaseConnection(datadir);
  let app = express();
  let server = new http.Server(app);
  let sockcomm = new socket.SocketCommunication(server, db);

  app.use(express.static(publicdir));
  app.use("/dist", express.static(distdir));

  server.listen(port);
  console.log(`Running at http://localhost:${port}`);
}

export function cli(argv) {
  if (argv.length > 2) {
    console.error("Too many arguments!");
    process.exit(1);
  }

  start();
}
