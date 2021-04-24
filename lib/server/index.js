"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.cli = exports.SledgeServer = void 0;
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
const path_1 = require("path");
const Server_1 = require("./Server");
const HTMLGenerator_1 = require("./HTMLGenerator");
const version_1 = require("../version");
const DEFAULT_PORT = 8080;
const HELP_MESSAGE = `Sledge - A judging system for hackathons, version ${version_1.VERSION}

CLI USAGE

  sledge [options]

OPTIONS

   --help, -h, -?
        Print this help and exit

   --version, -V
        Print the version and exit

   --port <PORT>, -p <PORT>
        Bind server to port (default 8080)

   --publicdir <DIR>
        Set the public directory (default ./public)

   --datadir <DIR>
        Set the data directory (default ./data)

   --generate-html <DIR>
        Generate static HTML, output to directory and exit

   --initonly, --no-initonly
        Exit immediately after starting if enabled (default disabled)

COPYRIGHT

    Sledge - A judging system for Hackathons
    Copyright (C) 2018 The Sledge Authors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

SEE ALSO

    https://github.com/hackru/sledge
`;
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
exports.SledgeServer = Server_1.Server;
function cli(argv) {
    let options = parseArgs(argv.slice(2));
    start(options);
}
exports.cli = cli;
function start(opts) {
    if (opts.hasError) {
        process.stderr.write(`Sledge: ${opts.errorString}\n`);
        process.exit(EXIT_FAILURE);
    }
    else if (opts.showHelp) {
        process.stdout.write(HELP_MESSAGE);
        process.exit(EXIT_SUCCESS);
    }
    else if (opts.showVersion) {
        process.stdout.write(`Sledge ${version_1.VERSION}\n`);
        process.exit(EXIT_SUCCESS);
    }
    else if (opts.generateHtml) {
        process.stdout.write(`Sledge ${version_1.VERSION}\n`);
        process.stdout.write(`Generating HTML to ${opts.htmlOutDir}...\n`);
        HTMLGenerator_1.generateStaticHtmlFiles(opts.htmlOutDir);
        process.stdout.write(`Done.\n`);
        process.exit(EXIT_SUCCESS);
    }
    else {
        process.stdout.write(`Sledge ${version_1.VERSION} - A judging system for hackathons\n`);
        let server = new Server_1.Server(opts.port, opts.dataDir, opts.publicDir);
        server.init();
        if (opts.exitAfterInit) {
            process.exit(EXIT_SUCCESS);
        }
    }
}
exports.start = start;
function parseArgs(args) {
    let opts = {
        hasError: false,
        errorString: "",
        showHelp: false,
        showVersion: false,
        port: DEFAULT_PORT,
        publicDir: path_1.resolve(process.cwd(), "public"),
        dataDir: path_1.resolve(process.cwd(), "data"),
        exitAfterInit: false,
        generateHtml: false
    };
    let i = 0;
    while (i < args.length) {
        let arg = args[i];
        if (arg === "--help" || arg === "-h" || arg === "-?") {
            opts.showHelp = true;
            return opts;
        }
        else if (arg === "--version" || arg === "-V") {
            opts.showVersion = true;
            return opts;
        }
        else if (arg === "--port" || arg === "-p") {
            let port = parseInt(args[i + 1], 10);
            if (isNaN(port) || port < 1) {
                opts.hasError = true;
                opts.errorString = `Bad port: ${args[i + 1]}`;
                return opts;
            }
            opts.port = port;
            i += 2;
        }
        else if (arg === "--publicdir") {
            let publicDir = args[i + 1];
            if (publicDir == null) {
                opts.hasError = true;
                opts.errorString = "You did not specify a public dir";
                return opts;
            }
            opts.publicDir = publicDir;
            i += 2;
        }
        else if (arg === "--datadir") {
            let dataDir = args[i + 1];
            if (dataDir == null) {
                opts.hasError = true;
                opts.errorString = "You did not specify a data dir";
                return opts;
            }
            opts.dataDir = dataDir;
            i += 2;
        }
        else if (arg === "--initonly") {
            opts.exitAfterInit = true;
            i += 1;
        }
        else if (arg === "--no-initonly") {
            opts.exitAfterInit = false;
            i += 1;
        }
        else if (arg === "--generate-html") {
            let htmlOutDir = args[i + 1];
            if (htmlOutDir == null) {
                opts.hasError = true;
                opts.errorString = "You did not specify an HTML output directory";
                return opts;
            }
            opts.htmlOutDir = args[i + 1];
            opts.generateHtml = true;
            return opts;
        }
        else {
            opts.hasError = true;
            opts.errorString = `Invalid option: ${arg}`;
            return opts;
        }
    }
    return opts;
}
//# sourceMappingURL=index.js.map