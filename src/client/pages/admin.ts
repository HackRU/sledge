import {SledgeClient}  from "../sledge.js";

let log, cmd;
let client : SledgeClient;

var lastCmd = "";
var commands = [];

export function printLn(txt="") {
    let timestr = (new Date()).toLocaleString();
    let logstr = "[" + timestr  + "] " + txt + "\n";

    console.log(logstr);
    log.value += logstr;

    log.scrollTo(0, log.scrollHeight);
}

export function printWrap(forward, txt, wrap=80) {
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

export function runCommand(txt) {
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

export function splitCommand(txt) {
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

export function registerCommand(name, description, run) {
    commands.push({name, description, run});
}

export function onSledgeEvent(evt) {
    if ( evt.trans ) {
        printLn("Recieved Transient Event: " + evt.type);
        printWrap(" data: ", JSON.stringify(evt.data));
    } else {
        printLn("Recieved Non-Transient Event: " + evt.type);
    }
}

export function init() {
    client = new SledgeClient({
      host: document.location.host
    });

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

    client.subscribe( onSledgeEvent );

    printLn("Admin Console Ready");
    printLn(" All events will be logged here. Type help for commands.");
    printLn();
}

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

registerCommand("clear", "Clear the command log", function (args) {
    log.value = "";
});
