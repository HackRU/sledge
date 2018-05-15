(function (adminPage) {
"use strict";

var log, cmd;
var lastCmd = "";

var commands = [];

function printLn(txt="") {
    let timestr = (new Date()).toLocaleString();
    let logstr = "[" + timestr  + "] " + txt + "\n";

    console.log(logstr);
    log.value += logstr;

    log.scrollTo(0, log.scrollHeight);
}
adminPage.printLn = printLn;

function printWrap(forward, txt, wrap=80) {
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
adminPage.printWrap = printWrap;

function runCommand(txt) {
    let args = splitCommand(txt);
    let action = args.length===0?"":args[0].toLowerCase();

    if ( action === "" ) {
        return;
    }

    lastCmd = txt;

    let command = null;
    for (let cmd of commands) {
        if (cmd && cmd.name === action) {
            command = cmd;
            break;
        }
    }

    if ( !command ) {
        printLn("Command not found: " + action);
        return;
    }

    command.run(args);
}
adminPage.runCommand = runCommand;

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
adminPage.splitCommand = splitCommand;

function registerCommand(name, description, run) {
    commands.push({name, description, run});
}

function onSledgeEvent(evt) {
    if ( evt.trans ) {
        printLn("Recieved Transient Event: " + evt.type);
        printWrap(" data: ", JSON.stringify(evt.data));
    } else {
        printLn("Recieved Non-Transient Event: " + evt.type);
    }
}
adminPage._onSledgeEvent = onSledgeEvent;

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

    if ( !localStorage.getItem("token") ) {
        localStorage.setItem("token", "test");
        localStorage.setItem("judgeId", "0");
    }

    sledge.init({
        token: localStorage.getItem("token")
    });
    sledge.subscribe( onSledgeEvent );

    sledge._socket().on("transient-response", data => console.log(data));

    printLn("Admin Console Ready");
    printLn(" All events will be logged here. Type help for commands.");
    printLn();
}
adminPage.init = init;

////////////////////
// Commands

registerCommand("help", "Print this help", function (args) {
    printLn(" === Help ===");
    printLn("Running a command without any arguments prints its usage");
    for (let cmd of commands) {
        printWrap(" "+cmd.name+" - ", cmd.description);
    }
    printLn();
});

registerCommand("devpost", "Scrape devpost", function (args) {
    printLn(" === Scrape Devpost ===");
    if ( args.length !== 2 ) {
        printLn("usage: devpost <url>");
        printLn();
        return;
    }

    printLn("WARNING: This may take a while. A message will be printed when");
    printLn("         scrape is successful or fails.");
    printLn("         In the meantime, the server will be unresponsive.");

    sledge.sendScrapeDevpost({
        url: args[1]
    });
});

registerCommand("addjudge", "Add a judge", function (args) {
    printLn(" === Add Judge ===");
    if ( args.length !== 3 ) {
        printLn("usage: addjudge <name> <email>");
        printLn();
        return;
    }

    printWrap("Name:  ", args[1]);
    printWrap("Email: ", args[2]);
    printLn();

    sledge.sendAddJudge({
        name: args[1],
        email: args[2]
    });
});

registerCommand("addsuperlative", "Add a superlative", function (args) {
    printLn(" === Add Superlative ===");
    if ( args.length !== 2 ) {
        printLn("usage: addsuperlative <name>");
        printLn();
        return;
    }

    printWrap("Name: ", args[1]);

    sledge.sendAddSuperlative({
        name: args[1]
    });
});

registerCommand("addtoken", "Manually add an auth token (usually done automatically on signin)", function (args) {
    printLn(" === Add Token ===");
    if ( args.length !== 3 ) {
        printLn("usage: addtoken <Judge ID> <secret>");
        printLn();
        return;
    }

    printWrap("Judge Id: ", args[1]);
    printWrap("Secret:   ", args[2]);

    sledge.sendAddToken({
        judgeId: args[1],
        secret: args[2]
    });
});

registerCommand("token", "View and set your token (must refresh to see changes)", function (args) {
    printLn(" === My Token ===");

    let subaction = args.length>1 ? args[0] : null;

    if ( subaction === "view" && args.length === 2 ) {
        printWrap("Your Current Token:    ", localStorage.getItem("token")||"[NOT SET]");
        printWrap("Your Current Judge Id: ", localStorage.getItem("judgeId")||"[NOT SET]");
        printLn();
    } else if ( subactoin === "remove" && args.length === 2 ) {
        printWrap("Your Previous Token:    ", localStorage.getItem("token")||"[NOT SET]");
        printWrap("Your Previous Judge Id: ", localStorage.getItem("judgeId")||"[NOT SET]");
        localStorage.clear();
        printLn("These have been reset. Refershing will reset to default admin.");
        printLn();
    } else if ( subaction === "set" && args.length === 4 ) {
        printWrap("Your Current Token:    ", localStorage.getItem("token")||"[NOT SET]");
        printWrap("Your Current Judge Id: ", localStorage.getItem("judgeId")||"[NOT SET]");
        localStorage.setItem("token", args[3]);
        localStorage.setItem("judgeId", args[2]);
        printWrap("Your New Token:    ", localStorage.getItem("token"));
        printWrap("Your New Judge Id: ", localStorage.getItem("judgeId"));
        printLn("(Hint: Refresh to take effect)");
        printLn();
    } else {
        printLn("usage: token view");
        printLn("       token remove");
        printLn("       token set <new judge id> <new token>");
    }
});

registerCommand("allocate", "Allocate judges", function (args) {
    printLn(" === Allocate Judges ===");
    if ( args.length < 2 ) {
        printLn("usage: allocate <method> [method-specific options]");
        printLn("       allocate tables <Judges Per Hack>");
        printLn("       allocate presentation");
        printLn();
        return;
    }

    if ( args[1] === "tables" ) {
        if ( args.length !== 3 ) {
            printLn("Bad args, see usage");
            printLn();
            return;
        }

        sledge.sendAllocateJudges({
            method: "tables",
            judgesPerHack: parseInt(args[2])
        });

        printWrap("Method: ", args[1]);
        printWrap("Judges Per Hack: ", parseInt(args[2]).toString());
        printLn();
    } else if ( args[1] === "presentation" ) {
        if ( args.length !== 2 ) {
            printLn("Bad args, see usage");
            printLn();
            return;
        }

        sledge.sendAllocateJudges({
            method: "presentation"
        });

        printWrap("Method: ", args[1]);
        printLn();
    } else {
        printLn("Unknown allocation method: "+args[1]);
    }
});

registerCommand("clear", "Clear the command log", function (args) {
    log.value = "";
});

})(window.adminPage || (window.adminPage = {}));
