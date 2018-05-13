#!/usr/bin/env node

const fs    = require("fs");
const path  = require("path");
const shell = require("shelljs");

function watchOnce(fname) {
    return new Promise( (resolve, reject) => {
        let watcher = fs.watch(fname, {
            recursive: true
        }, function (type) {
            if (watcher) {
                resolve(type);
                watcher.close();
                watcher = null;
            }
        });
    });
}

shell.env["PATH"] = path.resolve(__dirname, "node_modules/.bin") + ":" + shell.env["PATH"];

let err;
let argv = process.argv;
if ( argv.length <= 2 ) {
    err = shell.exec("tsc");
    if (err.code) {
        shell.echo("Error: tsc failed");
        shell.exit(1);
    }
} else if ( argv.length === 3 && argv[2] === "watch" ) {
    let timeout = 500;

    let compile = () => {
        shell.echo("Recompiling...");
        err = shell.exec("tsc");
        shell.echo(" ======= (%d)\n", err.code);

        setTimeout( () => {
            watchOnce("./src").then(compile);
        }, timeout);
    };

    compile();
} else {
    shell.echo("Bad args");
    shell.exit(1);
}

