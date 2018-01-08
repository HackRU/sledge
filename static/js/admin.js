(function () {
"use strict";

var log, cmd;
var lastCmd = "";

function printLn(txt="") {
    let timestr = (new Date()).toLocaleString();
    let logstr = "[" + timestr  + "] " + txt + "\n";

    console.log(logstr);
    log.value += logstr;

    log.scrollTo(0, log.scrollHeight);
}

function printWrap(forward, txt, wrap=60) {
    let lines = txt.split("\n").map( l => l.split(""));
    printLn( forward + lines[0].splice(0, wrap-forward.length).join("") );
    for (let i=0;i<lines.length;i++) {
        let line = lines[i];
        do {
            if ( i === 0 && line.length === 0 ) break;

            let whitespace = (new Array(forward.length+1)).join(" ");
            let content = line.splice(0, Math.max(1, wrap - forward.length));
            printLn( whitespace + content.join("") );
        } while ( line.length > 0 );
    }
}

function runCommand(txt) {
    let args = splitCommand(txt);
    let action = args.length===0?"":args[0].toLowerCase();

    if ( action === "" ) {
        return;
    } else if ( action === "send" ) {
        if ( !args[1] || !args[2] ) {
            printLn("usage: send <socketio event> <json>");
            printLn();
            return;
        }

        let json = JSON.parse(args[2]);
        printLn(" === Sending Raw Socketio Event ===");
        printWrap("Event: ", args[1]);
        printWrap("Data: ", JSON.stringify(json));
        printLn();
        sledge.sendRaw(args[1], json);
    } else if ( action === "devpost" ) {
        if (!args[1]) {
            printLn("usage: devpost <url>");
            printLn();
            return;
        }

        scrapeDevpost(args[1])
    } else if ( action === "addjudge" ) {
        if ( args.length !== 3 ) {
            printLn("usage: addjudge <name> <email>");
            printLn();
            return;
        }

        addJudge(args[1], args[2]);
    } else {
        printWrap("Unknown command: ", action);
    }

    if ( action !== "" ) {
        lastCmd = txt;
    }
}

function splitCommand(txt) {
    let tokens = txt.split("").reverse();
    let args = [];

    if ( tokens.length === 0 ) return [];

    let token = tokens.pop();
    let peek = tokens.length>0?tokens.pop():null;
    let next = () => { token=peek;peek=tokens.length>0?tokens.pop():null; };


    while ( token !== null ) {
        if ( token === " " ) {
            next();
        } else if ( token === "\"") {
            let arg = "";
            next();
            while ( token !== null && token !== "\"" ) {
                if ( token === "\\" && peek === "\"" ) {
                    arg += "\"";
                    next();
                } else if ( token === "\\" && peek === "\\" ) {
                    arg += "\\";
                    next();
                } else {
                    arg += token;
                }
                next();
            }
            next();

            if ( arg !== "" ) args.push(arg);
        } else {
            let arg = token;
            next();
            while ( token !== null && token !== " " && token != "\"" ) {
                arg += token;
                next();
            }
            args.push(arg);
        }
    }

    return args;
}

function onSledgeEvent(evt) {
    if ( evt.trans ) {
        printLn("Recieved Transient Event: " + evt.type);
        printWrap(" data: ", JSON.stringify(evt.data));
    } else {
        printLn("Recieved Non-Transient Event: " + evt.type);
    }
}

function init() {
    log = document.getElementById("log");
    cmd = document.getElementById("cmd");

    log.value = "";

    cmd.addEventListener("keypress", function (evt) {
        if ( evt.code === "Enter" ) {
            runCommand(cmd.value);
            cmd.value = "";
        } else if ( evt.code == "ArrowUp" ) {
            cmd.value = lastCmd;
        }
    });

    sledge.init();
    sledge.subscribe( onSledgeEvent );

    printLn("Admin Console Ready");
    printLn(" All events will be logged here. See admin.js for commands.");
    printLn();
}
window.addEventListener("load", init);

// Stuff Admins can do

function scrapeDevpost(url) {
    printLn(" === Scrape Devpost ===");
    printWrap("Scraping: ", url);
    printLn("Warning: This may take a while. A message will be printed when ");
    printLn("         scrape is successful or fails.");
    printLn("         In the meantime, the server will be unresponsive.");
    printLn();

    sledge.scrapeDevpost(url);
}

function addJudge(name, email) {
    printLn(" === Add Judge ===");
    printWrap("Name: ", name);
    printWrap("Email: ", email);
    printLn();

    sledge.addJudge(name, email);
}

window.admin = {
    printLn,
    printWrap,
    splitCommand,

    scrapeDevpost,

};

})();
