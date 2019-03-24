/*
 * Sledge - A judging system for hackathons
 * Copyright (C) 2018 The Sledge Authors

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {Server as HttpServer} from "http";
import {default as express, Express} from "express";

import {log} from "./log";

import {Database} from "./Database";
import {SocketAttacher} from "./SocketAttacher";
import {EventHandler} from "./EventHandler";

export class Server {
  private isInitialized: boolean;

  private express: Express;
  private http: HttpServer;

  private db: Database;
  private eventHandler: EventHandler;
  private socketAttacher: SocketAttacher;

  constructor(private port: number, private dataDir: string, private publicDir: string) {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      throw new Error("Server already initialized");
    }
    this.isInitialized = true;

    this.express = express();
    this.express.use(express.static(this.publicDir));
    this.http = new HttpServer(this.express);

    this.db = new Database(this.dataDir);
    this.eventHandler = new EventHandler(this.db);
    this.socketAttacher = new SocketAttacher(this.http, this.eventHandler.getRequestHandler());

    this.http.listen(this.port);
    log(`Running on :${this.port}`);
  }
}
