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
            printLn( whitespace + line.splice(0,wrap - forward.length)
                    .join(""));
        } while ( line.length > 0 );
    }
}

function runCommand(txt) {
    let args = txt.trim().split(" ");
    let action = args[0].toLowerCase();

    if ( action === "") {
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
        sledge.sendRaw(args[1], args[2]);
    } else if ( action === "devpost" ) {
        if (!args[1]) {
            printLn("usage: devpost <url>");
            printLn();
            return;
        }

        scrapeDevpost(args[1])
    } else {
        printLn("Unknown command " + action + " in "+txt);
    }

    if ( action != "") {
        lastCmd = txt;
    }
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
    printLn(" === Scrape Devpost === ");
    printWrap("Scraping: ", url);
    printLn("Warning: This may take a while. A message will be printed when ");
    printLn("         scrape is successful or fails.");
    printLn("         In the meantime, the server will be unresponsive.");
    printLn();

    sledge.scrapeDevpost(url);
}

window.admin = {
    printLn,

    scrapeDevpost,
};

})();
