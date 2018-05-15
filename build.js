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

function compile() {
    let err;

    err = shell.rm("-rf", "dist");
    if (err.code) {
        return err;
    }

    err = shell.cp("-R", "src", "dist/");
    if (err.code) {
        return err;
    }

    err = shell.exec("tsc");
    if (err.code) {
        return err;
    }

    return null;
}

let err;
let argv = process.argv;
if ( argv.length <= 2 ) {
    err = compile();
    if (err) {
        shell.echo("Error: tsc failed");
        shell.exit(1);
    }
} else if ( argv.length === 3 && argv[2] === "watch" ) {
    let timeout = 500;

    let c = () => {
        shell.echo("\nRecompiling...");
        err = compile();
        shell.echo(" ======= (%d)", err ? err.code : 0);

        setTimeout( () => {
            watchOnce("./src").then(c);
        }, timeout);
    };

    c();
} else {
    shell.echo("Bad args");
    shell.exit(1);
}

