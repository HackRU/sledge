import express  from "express";
import http     from "http";
import path     from "path";

import * as persistence from "./persistence/database.js";
import * as socket      from "./socket.js";

export function start({port, publicDir, dataDir} : SetupOptions) {
  console.log("Public Directory: %s", publicDir);
  console.log("Data Directory: %s", dataDir);

  let db = new persistence.DatabaseConnection(dataDir);
  let app = express();
  let server = new http.Server(app);
  let sockcomm = new socket.SocketCommunication(server, db);

  app.use(express.static(publicDir));

  server.listen(port);
  console.log(`Running at http://localhost:${port}`);
}

export interface SetupOptions {
  port : number;
  publicDir : string;
  dataDir: string;
}
