import {Server as HttpServer} from "http";
import {default as express, Express} from "express";

import {VERSION} from "../version"
import {log} from "./log";

import {DatabaseConnection} from "./DatabaseConnection";
import {EventHandler} from "./EventHandler";
import {Socket} from "./Socket";

/**
 * This is the instance of the Sledge server, bringing other components together
 */
export class Server {
  private isInitialized: boolean;

  private http: HttpServer;
  private express: Express;
  private db: DatabaseConnection;
  private socket: Socket;
  private eventHandler: EventHandler;

  constructor(private port: number, private dataDir: string, private publicDir: string) {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      throw new Error("Attempted to start already initialized Sledge server");
    }
    this.isInitialized = true;

    log(`Public Directory: ${this.publicDir}`);
    log(`Data Directory: ${this.dataDir}`);
    log(`Port: ${this.port}`);

    this.express = express();
    this.express.use(express.static(this.publicDir));
    this.http = new HttpServer(this.express);
    this.db = new DatabaseConnection(this.dataDir);
    this.socket = new Socket(this.http);
    this.eventHandler = new EventHandler(this.socket, this.db);

    this.http.listen(this.port);
    log(`Running at http://localhost:${this.port}`);
  }
}
