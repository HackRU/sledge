"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
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
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const log_1 = require("./log");
const Database_1 = require("./Database");
const SocketAttacher_1 = require("./SocketAttacher");
const EventHandler_1 = require("./EventHandler");
const ServerSocket_1 = require("./ServerSocket");
class Server {
    constructor(port, dataDir, publicDir) {
        this.port = port;
        this.dataDir = dataDir;
        this.publicDir = publicDir;
        this.isInitialized = false;
    }
    init() {
        if (this.isInitialized) {
            throw new Error("Server already initialized");
        }
        this.isInitialized = true;
        this.express = express_1.default();
        this.express.use(express_1.default.static(this.publicDir));
        this.http = new http_1.Server(this.express);
        this.db = new Database_1.Database(this.dataDir);
        this.socketAttacher = new SocketAttacher_1.SocketAttacher(this.http);
        this.serverSocket = new ServerSocket_1.ServerSocket(this.socketAttacher);
        this.eventHandler = new EventHandler_1.EventHandler(this.db, this.serverSocket);
        this.http.listen(this.port);
        log_1.log(`Running on :${this.port}`);
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map