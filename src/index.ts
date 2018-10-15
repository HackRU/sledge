/*
 * Sledge - A judging system for hackathons
 * Copyright (C) 2018 Eric Roberts

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

import {resolve} from "path";

import {SetupOptions, start} from "./server/setup";

const DEFAULT_PORT = 8080;

const publicDir = resolve(__dirname, "../public");
const dataDir = resolve(process.cwd(), "data");

export function cli(argv: string[]) {
  let opts : SetupOptions = {
    port: DEFAULT_PORT,
    publicDir, dataDir
  };

  if (argv.length === 3 && argv[2] === "--version") {
    console.log("0.0.1");
    process.exit(0);
  } else if (argv.length === 3 && argv[2] === "--help") {
    console.log("usage: node %s [port]", argv[1]);
    process.exit(0);
  } else if (argv.length === 3) {
    let port = parseInt(argv[2]);
    if (isNaN(port)) {
      console.error("Invalid port!");
      process.exit(1);
    } else {
      opts.port = port;
    }
  } else if (argv.length > 2) {
    console.error("Too many arguments!");
    process.exit(1);
  }

  start(opts);
}
