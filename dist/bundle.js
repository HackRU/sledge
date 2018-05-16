/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
module.exports = __webpack_require__(18);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(2);
__webpack_require__(3);
__webpack_require__(4);
__webpack_require__(5);
__webpack_require__(6);
__webpack_require__(7);
__webpack_require__(8);
__webpack_require__(9);
__webpack_require__(10);
__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(14);
__webpack_require__(15);
__webpack_require__(16);
__webpack_require__(17);
let w = window;
if (w.pages) {
    throw new Error("Property window.pages already exists.");
}
else {
    w.pages = {};
}


/***/ }),
/* 2 */
/***/ (function(module, exports) {

(function (sledge) {
"use strict";

var socket = null;
var subscribers = [];
var handlers = [];
var initialized = false;

sledge._socket = () => socket;
sledge._subscribers = subscribers;
sledge._handlers = handlers;
sledge._initialized = () => initialized;

////////////////////
// Global Tables

var tables = {
    hacks: [], // {id, name, description, location}
    judges: [], // {id, name, email}
    judgeHacks: [], // {id, judgeId, hackId, priority}
    superlatives: [], // {id, name}
    superlativePlacements: [], // {id, judgeId, superlativeId, firstChoice, secondChoice}
    ratings: [], // {id, judgeId, hackId, rating}
};
sledge._tables = tables;

////////////////////
// Private Helpers

function updateTables(data) {
    for ( let table of Object.keys(tables) ) {
        if ( data[table] ) {
            for ( let row of data[table] ) {
                if ( row && row.id ) {
                    tables[table][row.id] = row;
                }
            }
        }
    }
}
sledge._updateTables = updateTables;

function sendChange(content) {
    for (let sub of subscribers)
        if (sub) sub(content);
}
sledge._sendChange = sendChange;

////////////////////
// Update Handlers

function onError(data) {
    console.log("Error", data);
}
handlers.push({ name: "error", handler: onError });
sledge._onError = onError;

function onUpdateFull(data) {
    tables.hacks.splice(0);
    tables.judges.splice(0);
    tables.judgeHacks.splice(0);
    tables.superlatives.splice(0);
    tables.superlativePlacements.splice(0);
    tables.ratings.splice(0);

    updateTables(data);
    initialized = true;

    sendChange({
        trans: false,
        type: "full"
    });
}
handlers.push({ name: "update-full", handler: onUpdateFull });
sledge._onUpdateFull = onUpdateFull;

function onUpdatePartial(data) {
    if ( !initialized ) return;
    updateTables(data);

    sendChange({
        trans: false,
        type: "partial"
    });
}
handlers.push({ name: "update-partial", handler: onUpdatePartial });
sledge._onUpdatePartial = onUpdatePartial;

////////////////////
// Requests and Transient Responses

function addTransientResponse(eventName) {
    handlers.push({
        name: eventName,
        handler: data => {
            sendChange({
                trans: true,
                type: eventName,
                data
            });
        }
    });
}
sledge._addTransientResponse = addTransientResponse;

function sendScrapeDevpost({url}) {
    socket.emit("devpost-scrape", {url});
}
addTransientResponse("devpost-scrape-response");
sledge.sendScrapeDevpost = sendScrapeDevpost;

function sendAddJudge({name, email}) {
    socket.emit("add-judge", {name, email});
}
addTransientResponse("add-judge-response");
sledge.sendAddJudge = sendAddJudge;

function sendAllocateJudges(opts) {
    if (!opts.method) throw new Error("allocateJudgeHacks: method must exist");

    socket.emit("allocate-judges", opts);
}
addTransientResponse("allocate-judges-response");
sledge.sendAllocateJudges = sendAllocateJudges;

function sendAddSuperlative({name}) {
    socket.emit("add-superlative", {name});
}
addTransientResponse("add-superlative-response");
sledge.sendAddSuperlative = sendAddSuperlative;

function sendAddToken({judgeId, secret}) {
    socket.emit("add-token", {judgeId, secret});
}
addTransientResponse("add-token-response");
sledge.sendAddToken = sendAddToken;

function sendRaw({eventName, json}) {
    socket.emit(eventName, json);
}
addTransientResponse("add-token-response");
sledge.sendRaw = sendRaw;

function sendRankSuperlative(data) {
    socket.emit("rank-superlative", {
        judgeId: data.judgeId,
        superlativeId: data.superlativeId,
        firstChoiceId: data.firstChoiceId,
        secondChoiceId: data.secondChoiceId
    });
}
addTransientResponse("rank-superlative-response");
sledge.sendRankSuperlative = sendRankSuperlative;

function sendRateHack({judgeId, hackId, rating}) {
    socket.emit("rate-hack", {
        judgeId, hackId, rating
    });
}
addTransientResponse("rate-hack-response");
sledge.sendRateHack = sendRateHack;

////////////////////
// Information Querying

function isInitialized() {
    return initialized;
}
sledge.isInitialized = isInitialized;

function getAllHacks() {
    if (!initialized) throw new Error("getAllHacks: Data not initialized");

    return tables.hacks;
}
sledge.getAllHacks = getAllHacks;

function getAllJudges() {
    if (!initialized) throw new Error("getAllJudges: Data not initialized");

    return tables.judges;
}
sledge.getAllJudges = getAllJudges;

function getJudgeInfo({judgeId}) {
    if (!initialized) throw new Error("getJudgeInfo: Data not initialized");

    return tables.judges[judgeId] || null;
}
sledge.getJudgeInfo = getJudgeInfo;

function getHacksOrder({judgeId}) {
    if (!initialized) throw new Error("getHacksOrder: Data not initialized");

    let order = tables.judgeHacks
        .filter( h => h.judgeId == judgeId )
        .sort( (jh1, jh2) => jh1.priority - jh2.priority )
        .map( jh => jh.hackId );

    let positions = [];
    for (let i=0;i<order.length;i++) {
        positions[order[i]] = i;
    }

    // order maps position to hackId
    // positions maps hackId to position
    return { order, positions };
}
sledge.getHacksOrder = getHacksOrder;

function getAllRatings() {
    if (!initialized) throw new Error("getAllRatings: Data not initialized");

    let ratings = [];
    for (let i=0;i<tables.hacks.length;i++) {
        let hackRatings = [];
        for (let j=0;j<tables.judges.length;j++) {
            hackRatings[j] = 0;
        }
        ratings[i] = hackRatings;
    }

    for (let rating of tables.ratings) {
        if (rating) {
            ratings[rating.hackId][rating.judgeId] = rating.rating;
        }
    }

    return ratings;
}
sledge.getAllRatings = getAllRatings;

function getJudgeRatings({judgeId}) {
    if (!initialized) throw new Error("getJudgeRatings: Data not initialized");

    let ratings = [];

    for (let i=0;i<tables.hacks.length;i++) {
        ratings[i] = 0;
    }

    for (let rating of tables.ratings) {
        if ( rating && rating.judgeId === judgeId ) {
            ratings[rating.hackId] = rating.rating;
        }
    }

    return ratings;
}
sledge.getJudgeRatings = getJudgeRatings;

function getSuperlatives() {
    if (!initialized) throw new Error("getSuperlatives: Data not initialized");

    let superlatives = [];
    for ( let superlative of tables.superlatives ) {
        if ( superlative ) {
            superlatives.push(superlative);
        }
    }

    return superlatives;
}
sledge.getSuperlatives = getSuperlatives;

function getAllSuperlativePlacements() {
    if (!initialized) throw new Error("getAllSuperlatives: Data not initialized");

    let supers = [];
    for (let i=0;i<tables.hacks.length;i++) {
        supers[i] = [];
        for (let j=0;j<tables.superlatives.length;j++) {
            supers[i][j] = {
                first: [],
                second: []
            };
        }
    }

    for (let s of tables.superlativePlacements) {
        if (s) {
            if (s.firstChoice > 0) {
                supers[s.firstChoice][s.superlativeId].first.push(s.judgeId);
            }
            if (s.secondChoice > 0) {
                supers[s.secondChoice][s.superlativeId].second.push(s.judgeId);
            }
        }
    }

    return supers;
}
sledge.getAllSuperlativePlacements = getAllSuperlativePlacements;

function getChosenSuperlatives({judgeId}) {
    if (!initialized) throw new Error("getChosenSuperlatives: Data not initialized");

    let chosen = [];

    // Initialize to 0
    for (let i=0;i<tables.superlatives.length;i++) {
        chosen.push({
            first: 0,
            second: 0
        });
    }

    // Find chosen
    for ( let choice of tables.superlativePlacements ) {
        if ( choice && choice.judgeId == judgeId ) {
            chosen[choice.superlativeId].first = choice.firstChoice;
            chosen[choice.superlativeId].second = choice.secondChoice;
        }
    }

    return chosen;
}
sledge.getChosenSuperlatives = getChosenSuperlatives;

////////////////////
// Other Exports

function subscribe(cb) {
    subscribers.push(cb);
}
sledge.subscribe = subscribe;

function init(opts) {
    if (socket) {
        throw new Error("Sledge: Socket already initialized!");
    }

    socket = io({query: "secret="+encodeURIComponent(opts.token)});

    for (let h of handlers) {
        socket.on(h.name, h.handler);
    }
}
sledge.init = init;

function initWithTestData(testdata) {
    updateTables(testdata);
    console.log(tables);

    setTimeout(function () {
        initialized = true;

        sendChange({
            trans: false,
            type: "full"
        });
    }, 200);
}
sledge.initWithTestData = initWithTestData;

})(window.sledge || (window.sledge = {}));


/***/ }),
/* 3 */
/***/ (function(module, exports) {

(function () {
"use strict";

function toggleClass(toggle, onClass, offClass) {
    if ( toggle && onClass ) {
        return " "+onClass;
    } else if ( !toggle && offClass ) {
        return " "+offClass;
    } else {
        return "";
    }
}
window.toggleClass = toggleClass;

})();


/***/ }),
/* 4 */
/***/ (function(module, exports) {

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


/***/ }),
/* 5 */
/***/ (function(module, exports) {

(function (judgePage) {
"use strict";

var myJudgeId = null;

function init() {
    let token = localStorage.getItem("token");
    let judgeId = parseInt(localStorage.getItem("judgeId"));

    if ( !token || isNaN(judgeId) ) {
        document.getElementById("app").appendChild(
            document.createTextNode("Bad token or Judge Id. Redirecting to login page..."));
	if (window.location.hash != "#local") {
            setTimeout(function () {
		window.location.href = "/login.html";
            }, 1500);
	}
        return;
    }

    if (window.location.hash == "#local") {
        sledge.initWithTestData(localTestData);
    } else {
        sledge.init({token});
    }

    myJudgeId = judgeId;

    var appContainer = document.getElementById("app");
    ReactDOM.render(
        React.createElement(
            JudgeAppWrapper, null), appContainer);
}
judgePage.init = init;

function getSledgeData() {
    if (sledge.isInitialized()) {
        let hacks = sledge.getAllHacks();
        let judgeInfo = sledge.getJudgeInfo({
            judgeId: myJudgeId
        });
        let orderInfo = sledge.getHacksOrder({
            judgeId: myJudgeId
        });
        let superlatives = sledge.getSuperlatives();
        let chosenSuperlatives = sledge.getChosenSuperlatives({
            judgeId: myJudgeId
        });
        let ratings = sledge.getJudgeRatings({
            judgeId: myJudgeId
        });

        return {
            initialized: true,
            myJudgeId,

            hacks,
            judgeInfo,
            hackOrdering: orderInfo.order,
            hackPositions: orderInfo.positions,
            superlatives,
            chosenSuperlatives,
            ratings
        };
    } else {
        return {
            initialized: false
        };
    }
}
judgePage.getSledgeData = getSledgeData;

////////////////////
// Toplevel Component

class JudgeAppWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sledge: getSledgeData()
        };
    }

    componentDidMount() {
        sledge.subscribe(this.onUpdate.bind(this));
    }

    onUpdate(data) {
        if ( !data.trans && sledge.isInitialized() ) {
            this.setState({
                sledge: getSledgeData()
            });
        }
    }

    render() {
        if (this.state.sledge.initialized) {
            return React.createElement(
                    comps.JudgeApp, this.state.sledge);
        } else {
            return React.createElement(
                    "span", null, "Loading...");
        }
    }
}
judgePage.JudgeAppWrapper = JudgeAppWrapper;

})(window.judgePage || (window.judgePage = {}));


/***/ }),
/* 6 */
/***/ (function(module, exports) {

(function (loginPage) {
"use strict";

var loginInputs;
var emailInput;
var passInput;
var loginButton;
var logoutButton;
var judgeButton;
var testButton;
var messageText;

var token = "";

function init() {
    loginInputs  = document.getElementById("loginInputs");
    emailInput   = document.getElementById("emailInput");
    passInput    = document.getElementById("passInput");
    loginButton  = document.getElementById("loginButton");
    logoutButton = document.getElementById("logoutButton");
    judgeButton  = document.getElementById("judgeButton");
    testButton  = document.getElementById("testButton");
    messageText  = document.getElementById("messageText");

    loginButton.disabled = false;
    logoutButton.disabled = false;
    judgeButton.disabled = false;
    testButton.disabled = false;

    emailInput.addEventListener("keypress", onTextKeyPress);
    passInput.addEventListener("keypress", onTextKeyPress);

    loginButton.addEventListener("click", onLogin);
    logoutButton.addEventListener("click", onLogout);
    judgeButton.addEventListener("click", onJudge);
    testButton.addEventListener("click", onTest);

    token = localStorage.getItem("token") || "";
    if (token) {
        setMessage("Connecting to Sledge... (Note: failure to connect may indicate bad credentials)");

        loginInputs.classList.add("hidden");
        loginButton.disabled = true;
        testButton.disabled = true;

        sledge.subscribe(function (xx) {
            if (sledge.isInitialized()) {
                let judgeId = parseInt(localStorage.getItem("judgeId"));
                let info = sledge.getJudgeInfo({judgeId});

                if (info) {
                    setMessage("You are logged in as "+info.name+" <"+info.email+"> (ID: "+info.id+").");
                } else {
                    setMessage("You are logged in, but we do not recognize Judge ID "+localStorage.getItem("judgeId")+"!");
                }
            }
        });
        sledge.init({token: localStorage.getItem("token")});
    } else {
        setMessage("You are not logged in.");
        logoutButton.disabled = true;
        judgeButton.disabled = true;
    }
}
loginPage.init = init;

function setMessage(txt) {
    messageText.innerHTML = "";
    let txtNode = document.createTextNode(txt);
    messageText.appendChild(txtNode);
}

function onTextKeyPress(evt) {
    if (evt.key === "Enter") {
        onLogin(null);
        evt.preventDefault();
    }
}

function onLogin(evt) {
    setMessage("Verifying login information...");

    loginInputs.classList.add("hidden");
    loginButton.disabled = true;

    if ( emailInput.value === "admin" || (/admin:[0-9]{1,}/).test(emailInput.value) ) {
        setMessage("Logging in as admin");
        localStorage.setItem("judgeId", emailInput.value === "admin" ? "0" : emailInput.value.split(":")[1]);
        localStorage.setItem("token", passInput.value);

        setTimeout(function () {
            window.location.href = window.location.href;
        }, 500);

        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        if (xhr.status != 200) {
            let printableMessage = xhr.responseText.replace(/\<[^>]{1,}\>/g,"\t");
            setMessage("Failed with Error: " + printableMessage);

            loginInputs.classList.remove("hidden");
            loginButton.disabled = false;
        } else {
            let res = JSON.parse(xhr.responseText);
            if (!res.success) {
                setMessage("Failed with Error: "+res.message);
                loginInputs.classList.remove("hidden");
                loginButton.disabled = false;
            } else {
                setMessage(res.message);
                localStorage.setItem("judgeId", res.judgeId);
                localStorage.setItem("token", res.token);

                window.location.href = window.location.href;
            }
        }
    });
    xhr.open("POST", "/login");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        email: emailInput.value,
        password: passInput.value
    }));
}

function onLogout(evt) {
    localStorage.removeItem("token");
    window.location.href = window.location.href;
}

function onJudge(evt) {
    window.location.href = "/judge.html";
}

function onTest(evt) {
    localStorage.setItem("judgeId", 1);
    localStorage.setItem("token", "test");
    window.location.href = window.location.href;
}

})(this.loginPage || (this.loginPage = {}));


/***/ }),
/* 7 */
/***/ (function(module, exports) {

(function (resultsPage) {
"use strict";

var winnersTable;
var superlativesTable;

function init() {
    winnersTable = document.getElementById("winnersTable");
    superlativesTable = document.getElementById("superlativesTable");

    sledge.init({
        token: localStorage.getItem("token")
    });
    sledge.subscribe(onSledgeEvent);
}
resultsPage.init = init;

function onSledgeEvent(evt) {
    if (sledge.isInitialized()) {
        renderWinnersTable();
        renderSuperlativesTable();
    }
}
resultsPage.onSledgeEvent = onSledgeEvent;

function renderWinnersTable() {
    let ratings = sledge.getAllRatings();
    let hacks = sledge.getAllHacks();
    let judges = sledge.getAllJudges();
    let averages = calcAverages(ratings);

    //sort hacks
    let len = averages.length;
    for (let i = 1; i < len; i++) {
	let tmp = averages[i]; //Copy of the current element.
	let tmpRating = ratings[i];
	let tmpHack = hacks[i];
	//Check through the sorted part and compare with the number in tmp.
	//maybe i should work out a way to not use var here, but whatever
	for (var j = i - 1; j > 0 && (averages[j] <= tmp); j--) {
	    //Shift the number
	    averages[j + 1] = averages[j];
	    ratings[j + 1] = ratings[j];
	    hacks[j + 1] = hacks[j];
	    
	}
	//Insert the copied number at the correct position
	//in sorted part.
	averages[j + 1] = tmp;
	ratings[j + 1] = tmpRating;
	hacks[j + 1] = tmpHack;
    }

    let ce = document.createElement.bind(document);
    let ct = document.createTextNode.bind(document);

    let thead = ce("thead");
    let thead_tr = ce("tr");
    let thead_tr_hacks = ce("th");
    thead_tr_hacks.appendChild(ct("Hack Name"));
    thead_tr.appendChild(thead_tr_hacks);
    for (let i=1;i<judges.length;i++) {
        let td = ce("th");
        td.appendChild(ct( judges[i].name ));
        thead_tr.appendChild(td);
    }
    let thead_tr_avg = ce("th");
    thead_tr_avg.appendChild(ct("Average"));
    thead_tr.appendChild(thead_tr_avg);
    thead.appendChild(thead_tr);

    let tbody = ce("tbody");
    for (let i=1;i<hacks.length;i++) {
        let tr = ce("tr");
        let tr_name = ce("td");
        tr_name.appendChild(ct(hacks[i].name));
        tr.appendChild(tr_name);

        for (let j=1;j<judges.length;j++) {
            let td = ce("td");
            td.appendChild(ct( ratingString(ratings[i][j]) ));
            tr.appendChild(td);
        }

        let tr_avg = ce("td");
        tr_avg.appendChild(ct(averages[i]>0?averages[i].toString(10):"N/A"));
        tr.appendChild(tr_avg);

        tbody.appendChild(tr);
    }

    winnersTable.innerHTML = "";
    winnersTable.appendChild(thead);
    winnersTable.appendChild(tbody);
}
resultsPage.renderWinnersTable = renderWinnersTable;

function ratingString(rating) {
    if ( rating < 0 ) {
        return "No Show";
    } else if ( rating == 0 ) {
        return "-";
    } else {
        return rating.toString(10);
    }
}
resultsPage.ratingString = ratingString;

function calcAverages(ratings) {
    return ratings.map(function (rs) {
        let raters = 0;
        let total = 0;
        for (let i=0;i<rs.length;i++) {
            if ( rs[i] > 0 ) {
                total += rs[i];
                raters++;
            }
        }

        if ( raters <= 0 ) {
            return -1;
        } else {
            return total / raters;
        }
    });
}
resultsPage.calcAverages = calcAverages;

function renderSuperlativesTable() {
    let scores = calcSuperScores();

    let ce = document.createElement.bind(document);
    let ct = document.createTextNode.bind(document);

    function th(name) {
        let th = ce("th");
        th.appendChild(ct(name));
        return th;
    }
    function td(name) {
        let td = ce("td");
        td.appendChild(ct(name));
        return td;
    }

    let hacks = sledge.getAllHacks();
    let ss = sledge.getSuperlatives();

    let thead = ce("thead");
    let thead_tr = ce("tr");
    thead_tr.appendChild(th("Hack Name"));
    for (let i=0;i<ss.length;i++) {
        thead_tr.appendChild(th(ss[i].name));
    }
    thead.appendChild(thead_tr);

    let tbody = ce("tbody");
    for (let i=1;i<hacks.length;i++) {
        let tr = ce("tr");
        tr.appendChild(td(hacks[i].name));
        for (let j=0;j<ss.length;j++) {
            tr.appendChild(td(scores[i][j]));
        }
        tbody.appendChild(tr);
    }

    superlativesTable.innerHTML = "";
    superlativesTable.appendChild(thead);
    superlativesTable.appendChild(tbody);
}
resultsPage.renderSuperlativesTable = renderSuperlativesTable;

function calcSuperScores() {
    let placements = sledge.getAllSuperlativePlacements();
    return placements.map(function (s) {
        return s.map(function (o) {
            return "First:"+o.first.length+" / Second:"+o.second.length+" = "
                + (o.first.length*2+o.second.length);
        });
    });
}
resultsPage.calcSuperScores = calcSuperScores;

})(window.resultsPage || (window.resultsPage = {}));


/***/ }),
/* 8 */
/***/ (function(module, exports) {

(function (sledge) {
"use strict";

var socket = null;
var subscribers = [];
var handlers = [];
var initialized = false;

sledge._socket = () => socket;
sledge._subscribers = subscribers;
sledge._handlers = handlers;
sledge._initialized = () => initialized;

////////////////////
// Global Tables

var tables = {
    hacks: [], // {id, name, description, location}
    judges: [], // {id, name, email}
    judgeHacks: [], // {id, judgeId, hackId, priority}
    superlatives: [], // {id, name}
    superlativePlacements: [], // {id, judgeId, superlativeId, firstChoice, secondChoice}
    ratings: [], // {id, judgeId, hackId, rating}
};
sledge._tables = tables;

////////////////////
// Private Helpers

function updateTables(data) {
    for ( let table of Object.keys(tables) ) {
        if ( data[table] ) {
            for ( let row of data[table] ) {
                if ( row && row.id ) {
                    tables[table][row.id] = row;
                }
            }
        }
    }
}
sledge._updateTables = updateTables;

function sendChange(content) {
    for (let sub of subscribers)
        if (sub) sub(content);
}
sledge._sendChange = sendChange;

////////////////////
// Update Handlers

function onError(data) {
    console.log("Error", data);
}
handlers.push({ name: "error", handler: onError });
sledge._onError = onError;

function onUpdateFull(data) {
    tables.hacks.splice(0);
    tables.judges.splice(0);
    tables.judgeHacks.splice(0);
    tables.superlatives.splice(0);
    tables.superlativePlacements.splice(0);
    tables.ratings.splice(0);

    updateTables(data);
    initialized = true;

    sendChange({
        trans: false,
        type: "full"
    });
}
handlers.push({ name: "update-full", handler: onUpdateFull });
sledge._onUpdateFull = onUpdateFull;

function onUpdatePartial(data) {
    if ( !initialized ) return;
    updateTables(data);

    sendChange({
        trans: false,
        type: "partial"
    });
}
handlers.push({ name: "update-partial", handler: onUpdatePartial });
sledge._onUpdatePartial = onUpdatePartial;

////////////////////
// Requests and Transient Responses

function addTransientResponse(eventName) {
    handlers.push({
        name: eventName,
        handler: data => {
            sendChange({
                trans: true,
                type: eventName,
                data
            });
        }
    });
}
sledge._addTransientResponse = addTransientResponse;

function sendScrapeDevpost({url}) {
    socket.emit("devpost-scrape", {url});
}
addTransientResponse("devpost-scrape-response");
sledge.sendScrapeDevpost = sendScrapeDevpost;

function sendAddJudge({name, email}) {
    socket.emit("add-judge", {name, email});
}
addTransientResponse("add-judge-response");
sledge.sendAddJudge = sendAddJudge;

function sendAllocateJudges(opts) {
    if (!opts.method) throw new Error("allocateJudgeHacks: method must exist");

    socket.emit("allocate-judges", opts);
}
addTransientResponse("allocate-judges-response");
sledge.sendAllocateJudges = sendAllocateJudges;

function sendAddSuperlative({name}) {
    socket.emit("add-superlative", {name});
}
addTransientResponse("add-superlative-response");
sledge.sendAddSuperlative = sendAddSuperlative;

function sendAddToken({judgeId, secret}) {
    socket.emit("add-token", {judgeId, secret});
}
addTransientResponse("add-token-response");
sledge.sendAddToken = sendAddToken;

function sendRaw({eventName, json}) {
    socket.emit(eventName, json);
}
addTransientResponse("add-token-response");
sledge.sendRaw = sendRaw;

function sendRankSuperlative(data) {
    socket.emit("rank-superlative", {
        judgeId: data.judgeId,
        superlativeId: data.superlativeId,
        firstChoiceId: data.firstChoiceId,
        secondChoiceId: data.secondChoiceId
    });
}
addTransientResponse("rank-superlative-response");
sledge.sendRankSuperlative = sendRankSuperlative;

function sendRateHack({judgeId, hackId, rating}) {
    socket.emit("rate-hack", {
        judgeId, hackId, rating
    });
}
addTransientResponse("rate-hack-response");
sledge.sendRateHack = sendRateHack;

////////////////////
// Information Querying

function isInitialized() {
    return initialized;
}
sledge.isInitialized = isInitialized;

function getAllHacks() {
    if (!initialized) throw new Error("getAllHacks: Data not initialized");

    return tables.hacks;
}
sledge.getAllHacks = getAllHacks;

function getAllJudges() {
    if (!initialized) throw new Error("getAllJudges: Data not initialized");

    return tables.judges;
}
sledge.getAllJudges = getAllJudges;

function getJudgeInfo({judgeId}) {
    if (!initialized) throw new Error("getJudgeInfo: Data not initialized");

    return tables.judges[judgeId] || null;
}
sledge.getJudgeInfo = getJudgeInfo;

function getHacksOrder({judgeId}) {
    if (!initialized) throw new Error("getHacksOrder: Data not initialized");

    let order = tables.judgeHacks
        .filter( h => h.judgeId == judgeId )
        .sort( (jh1, jh2) => jh1.priority - jh2.priority )
        .map( jh => jh.hackId );

    let positions = [];
    for (let i=0;i<order.length;i++) {
        positions[order[i]] = i;
    }

    // order maps position to hackId
    // positions maps hackId to position
    return { order, positions };
}
sledge.getHacksOrder = getHacksOrder;

function getAllRatings() {
    if (!initialized) throw new Error("getAllRatings: Data not initialized");

    let ratings = [];
    for (let i=0;i<tables.hacks.length;i++) {
        let hackRatings = [];
        for (let j=0;j<tables.judges.length;j++) {
            hackRatings[j] = 0;
        }
        ratings[i] = hackRatings;
    }

    for (let rating of tables.ratings) {
        if (rating) {
            ratings[rating.hackId][rating.judgeId] = rating.rating;
        }
    }

    return ratings;
}
sledge.getAllRatings = getAllRatings;

function getJudgeRatings({judgeId}) {
    if (!initialized) throw new Error("getJudgeRatings: Data not initialized");

    let ratings = [];

    for (let i=0;i<tables.hacks.length;i++) {
        ratings[i] = 0;
    }

    for (let rating of tables.ratings) {
        if ( rating && rating.judgeId === judgeId ) {
            ratings[rating.hackId] = rating.rating;
        }
    }

    return ratings;
}
sledge.getJudgeRatings = getJudgeRatings;

function getSuperlatives() {
    if (!initialized) throw new Error("getSuperlatives: Data not initialized");

    let superlatives = [];
    for ( let superlative of tables.superlatives ) {
        if ( superlative ) {
            superlatives.push(superlative);
        }
    }

    return superlatives;
}
sledge.getSuperlatives = getSuperlatives;

function getAllSuperlativePlacements() {
    if (!initialized) throw new Error("getAllSuperlatives: Data not initialized");

    let supers = [];
    for (let i=0;i<tables.hacks.length;i++) {
        supers[i] = [];
        for (let j=0;j<tables.superlatives.length;j++) {
            supers[i][j] = {
                first: [],
                second: []
            };
        }
    }

    for (let s of tables.superlativePlacements) {
        if (s) {
            if (s.firstChoice > 0) {
                supers[s.firstChoice][s.superlativeId].first.push(s.judgeId);
            }
            if (s.secondChoice > 0) {
                supers[s.secondChoice][s.superlativeId].second.push(s.judgeId);
            }
        }
    }

    return supers;
}
sledge.getAllSuperlativePlacements = getAllSuperlativePlacements;

function getChosenSuperlatives({judgeId}) {
    if (!initialized) throw new Error("getChosenSuperlatives: Data not initialized");

    let chosen = [];

    // Initialize to 0
    for (let i=0;i<tables.superlatives.length;i++) {
        chosen.push({
            first: 0,
            second: 0
        });
    }

    // Find chosen
    for ( let choice of tables.superlativePlacements ) {
        if ( choice && choice.judgeId == judgeId ) {
            chosen[choice.superlativeId].first = choice.firstChoice;
            chosen[choice.superlativeId].second = choice.secondChoice;
        }
    }

    return chosen;
}
sledge.getChosenSuperlatives = getChosenSuperlatives;

////////////////////
// Other Exports

function subscribe(cb) {
    subscribers.push(cb);
}
sledge.subscribe = subscribe;

function init(opts) {
    if (socket) {
        throw new Error("Sledge: Socket already initialized!");
    }

    socket = io({query: "secret="+encodeURIComponent(opts.token)});

    for (let h of handlers) {
        socket.on(h.name, h.handler);
    }
}
sledge.init = init;

function initWithTestData(testdata) {
    updateTables(testdata);
    console.log(tables);

    setTimeout(function () {
        initialized = true;

        sendChange({
            trans: false,
            type: "full"
        });
    }, 200);
}
sledge.initWithTestData = initWithTestData;

})(window.sledge || (window.sledge = {}));


/***/ }),
/* 9 */
/***/ (function(module, exports) {

window.localTestData = {"hacks":[null,{"id":1,"name":"Prudential Challenge - UA","description":"We created a responsive web app that translates speech to text and inputs it into a realtime database.","location":0},{"id":2,"name":"Prudential Hack RU Challenge 2","description":"Determined customers with the lowest risk based on a prediction of what their risk level would be","location":0},{"id":3,"name":"Rock-Paper-Myo","description":"A rock, paper, scissors machine that always beats you using the Myo armband","location":0},{"id":4,"name":"Latrine.IO","description":"fadsfadsf","location":0},{"id":5,"name":"MayDay","description":"Hurricane? Earthquake? Try MayDay - push a button and get a list of volunteers closest to you via SMS!","location":0},{"id":6,"name":"Diabetes Diagnose box","description":"we can diagnose diabetes based on the information that  patients give us","location":0},{"id":7,"name":"Sign-O-MYO","description":"A hack to quiz yourself on American Sign Language using a Myo Armband","location":0},{"id":8,"name":"Text Me(me)","description":"A fast and convenient way to create memes with your personal message and then send the meme to someone.","location":0},{"id":9,"name":"Medictation","description":"Website and text message system to make taking medication easier","location":0},{"id":10,"name":"categorical_time_series_visualization","description":"innovative implementation of MCA to visualize time series data with categorical attributes","location":0},{"id":11,"name":"Split.ai","description":"Split.ai is a user friendly, clean interface tab split that summerizes totals for each person in the group.","location":0},{"id":12,"name":"Delphi","description":"Predict The Most Effective Marketing Strategy for Insurance","location":0},{"id":13,"name":"calcGoggles","description":"a classroom tool to help with visualizing strange solids","location":0},{"id":14,"name":"Pay Store","description":"A distributed platform for financial apps!","location":0},{"id":15,"name":"Su Prudential hack ru Challenge","description":"data analysis","location":0},{"id":16,"name":"Tech.Declassified","description":"A Natural Language Processor based classifier for Tech related Articles!","location":0},{"id":17,"name":"Handwritten Expression Evaluator","description":"Solve any arithmetic handwritten mathematical expression instantly with Machine Learning","location":0},{"id":18,"name":"WebReg Helper","description":"Get rate my professor easier","location":0},{"id":19,"name":"Rutgers-Ratio","description":"Discover the details of parties ahead of time so you pick the best one","location":0},{"id":20,"name":"Insights","description":"This dashboard helps you determine the most important customers","location":0},{"id":21,"name":"RU Events","description":"RU Events is an Android Application to fetch/RSVP/notify/search Facebook events happening at Rutgers!","location":0},{"id":22,"name":"WeatherApp","description":"Get weather easier","location":0},{"id":23,"name":"Alligator","description":"A better way to learn with flashcards","location":0},{"id":24,"name":"Prudential Data Analysis","description":"Determining which clients have the highest risk factors based on health, family history, and other factors","location":0},{"id":25,"name":"Fly Chocobo!","description":"A baby chocobo flaps its powerful wings against the power of gravity to maneuver and destroy anything in its path.","location":0},{"id":26,"name":"Nosedive","description":"Facial Recognition application that connects users by their social media accounts","location":0},{"id":27,"name":"How RU Feeling?","description":"Aced that exam?Cramped in a LX?Get sent to a Rutgers-themed URL to fit your mood+share it w/ friends by SMS messaging","location":0},{"id":28,"name":"Cutting Edge","description":"Dynamic cutting that cuts objects where the sword slices into them. It is one to one with the user's swings","location":0},{"id":29,"name":"HackRu","description":"A predictive model to do a risk assessment of clients for life insurance.","location":0},{"id":30,"name":"Re-Call","description":"Whether it's a conference call or a phone interview, you never have to forget your important conversations again!","location":0},{"id":31,"name":"Leap Motion controlled Computer","description":"Using a mouse or touching computer screen is not always easy. Let's control it by gestures in the air defined by us","location":0},{"id":32,"name":"Meat Me","description":"Are you a lone diners? Meat Me is your solution. Let's chat and eat up with real people!","location":0},{"id":33,"name":"Meet Up","description":"A social platform for getting together with your friends short-term","location":0},{"id":34,"name":"Project: Pin Up Subscription","description":"Keep track of subscription and purchases all in one, along with any finical planning!","location":0},{"id":35,"name":"Insurance Text Filler","description":"This app makes filling in applications easy for you by using speech to text and scans your ID to auto fill entries","location":0},{"id":36,"name":"Virtualoso","description":"A virtual MIDI keyboard that is far more portable than a standard keyboard and allows for more fluid music production","location":0},{"id":37,"name":"Multiplayer Wizard Online","description":"Wizards running around destroying each other with a variety of spells","location":0},{"id":38,"name":"eventLab","description":"A platform for coordinating and analyzing events","location":0},{"id":39,"name":"Have Dental? Get Acci-dental","description":"Quickly visualize how customers are purchasing your insurance","location":0},{"id":40,"name":"Good Business Indicators","description":"Model to indicate and find a low risk insurer","location":0},{"id":41,"name":"rutgersb.us","description":"A tool to navigate the bus system for scared freshmen, by a scared freshman","location":0},{"id":42,"name":"HackRU_Vitech_Challenge","description":"Deep Learning Platform capable of successfully predicting the likelihood of a person purchasing an insurance option","location":0},{"id":43,"name":"Data Vizualization","description":"data analysis, visualization, web app.","location":0},{"id":44,"name":"Brightness_Curve(Concept)","description":"The auto-brightness on your phone isnt the most efficient. Why cant it be as easy as setting a fan curve.","location":0},{"id":45,"name":"Nimble Norse 2","description":"Sequel to an infinite runner made in senior year of high school","location":0},{"id":46,"name":"Homecare","description":"An app that provides patients with a platform to gain more information about their orthopedic injuries.","location":0},{"id":47,"name":"Python Tutorial","description":"I'm teaching myself python!","location":0},{"id":48,"name":"Prudential Risk Evaluation: Modeling & Visualizations","description":"Submission for Prudential's Challenge #2: Features R Code, visualization and Python query","location":0},{"id":49,"name":"Smart Camera","description":"A combination of a webcam and a Rasberry Pi allows you to protect your home from burglars without spending hundreds.","location":0},{"id":50,"name":"Capital One Budgeting App","description":"An app to track your money usage in your Capital One account - brought to you by Team MMYK","location":0},{"id":51,"name":"need more readers","description":"determine good ways to inspire better writing","location":0},{"id":52,"name":"Drivers ID Scanner","description":"Scan information from a drivers ID to autofill registration forms","location":0},{"id":53,"name":"At least it's a submission right?","description":"I just want to be entered into a prize","location":0}],"judges":[null,{"id":1,"name":"Test Judge","email":"test@test.com"},{"id":2,"name":"Judge 2","email":"judge2"},{"id":3,"name":"Judge 3","email":"judge3"},{"id":4,"name":"Judge 4","email":"judge5"},{"id":5,"name":"Judge 5","email":"judge5"}],"judgeHacks":[null,{"id":1,"judgeId":1,"hackId":1,"priority":0},{"id":2,"judgeId":1,"hackId":2,"priority":1},{"id":3,"judgeId":1,"hackId":3,"priority":2},{"id":4,"judgeId":1,"hackId":4,"priority":3},{"id":5,"judgeId":1,"hackId":5,"priority":4},{"id":6,"judgeId":1,"hackId":6,"priority":5},{"id":7,"judgeId":1,"hackId":7,"priority":6},{"id":8,"judgeId":1,"hackId":8,"priority":7},{"id":9,"judgeId":1,"hackId":9,"priority":8},{"id":10,"judgeId":1,"hackId":10,"priority":9},{"id":11,"judgeId":1,"hackId":11,"priority":10},{"id":12,"judgeId":1,"hackId":12,"priority":11},{"id":13,"judgeId":1,"hackId":13,"priority":12},{"id":14,"judgeId":1,"hackId":14,"priority":13},{"id":15,"judgeId":1,"hackId":15,"priority":14},{"id":16,"judgeId":1,"hackId":16,"priority":15},{"id":17,"judgeId":1,"hackId":17,"priority":16},{"id":18,"judgeId":1,"hackId":18,"priority":17},{"id":19,"judgeId":1,"hackId":19,"priority":18},{"id":20,"judgeId":1,"hackId":20,"priority":19},{"id":21,"judgeId":1,"hackId":21,"priority":20},{"id":22,"judgeId":1,"hackId":22,"priority":21},{"id":23,"judgeId":1,"hackId":23,"priority":22},{"id":24,"judgeId":2,"hackId":14,"priority":0},{"id":25,"judgeId":2,"hackId":15,"priority":1},{"id":26,"judgeId":2,"hackId":16,"priority":2},{"id":27,"judgeId":2,"hackId":17,"priority":3},{"id":28,"judgeId":2,"hackId":18,"priority":4},{"id":29,"judgeId":2,"hackId":19,"priority":5},{"id":30,"judgeId":2,"hackId":20,"priority":6},{"id":31,"judgeId":2,"hackId":21,"priority":7},{"id":32,"judgeId":2,"hackId":22,"priority":8},{"id":33,"judgeId":2,"hackId":23,"priority":9},{"id":34,"judgeId":2,"hackId":24,"priority":10},{"id":35,"judgeId":2,"hackId":25,"priority":11},{"id":36,"judgeId":2,"hackId":26,"priority":12},{"id":37,"judgeId":2,"hackId":27,"priority":13},{"id":38,"judgeId":2,"hackId":28,"priority":14},{"id":39,"judgeId":2,"hackId":29,"priority":15},{"id":40,"judgeId":2,"hackId":30,"priority":16},{"id":41,"judgeId":2,"hackId":31,"priority":17},{"id":42,"judgeId":2,"hackId":32,"priority":18},{"id":43,"judgeId":2,"hackId":33,"priority":19},{"id":44,"judgeId":3,"hackId":24,"priority":0},{"id":45,"judgeId":3,"hackId":25,"priority":1},{"id":46,"judgeId":3,"hackId":26,"priority":2},{"id":47,"judgeId":3,"hackId":27,"priority":3},{"id":48,"judgeId":3,"hackId":28,"priority":4},{"id":49,"judgeId":3,"hackId":29,"priority":5},{"id":50,"judgeId":3,"hackId":30,"priority":6},{"id":51,"judgeId":3,"hackId":31,"priority":7},{"id":52,"judgeId":3,"hackId":32,"priority":8},{"id":53,"judgeId":3,"hackId":33,"priority":9},{"id":54,"judgeId":3,"hackId":34,"priority":10},{"id":55,"judgeId":3,"hackId":35,"priority":11},{"id":56,"judgeId":3,"hackId":36,"priority":12},{"id":57,"judgeId":3,"hackId":37,"priority":13},{"id":58,"judgeId":3,"hackId":38,"priority":14},{"id":59,"judgeId":3,"hackId":39,"priority":15},{"id":60,"judgeId":3,"hackId":40,"priority":16},{"id":61,"judgeId":3,"hackId":41,"priority":17},{"id":62,"judgeId":3,"hackId":42,"priority":18},{"id":63,"judgeId":3,"hackId":43,"priority":19},{"id":64,"judgeId":4,"hackId":34,"priority":0},{"id":65,"judgeId":4,"hackId":35,"priority":1},{"id":66,"judgeId":4,"hackId":36,"priority":2},{"id":67,"judgeId":4,"hackId":37,"priority":3},{"id":68,"judgeId":4,"hackId":38,"priority":4},{"id":69,"judgeId":4,"hackId":39,"priority":5},{"id":70,"judgeId":4,"hackId":40,"priority":6},{"id":71,"judgeId":4,"hackId":41,"priority":7},{"id":72,"judgeId":4,"hackId":42,"priority":8},{"id":73,"judgeId":4,"hackId":43,"priority":9},{"id":74,"judgeId":4,"hackId":44,"priority":10},{"id":75,"judgeId":4,"hackId":45,"priority":11},{"id":76,"judgeId":4,"hackId":46,"priority":12},{"id":77,"judgeId":4,"hackId":47,"priority":13},{"id":78,"judgeId":4,"hackId":48,"priority":14},{"id":79,"judgeId":4,"hackId":49,"priority":15},{"id":80,"judgeId":4,"hackId":50,"priority":16},{"id":81,"judgeId":4,"hackId":51,"priority":17},{"id":82,"judgeId":4,"hackId":52,"priority":18},{"id":83,"judgeId":4,"hackId":53,"priority":19},{"id":84,"judgeId":5,"hackId":44,"priority":0},{"id":85,"judgeId":5,"hackId":45,"priority":1},{"id":86,"judgeId":5,"hackId":46,"priority":2},{"id":87,"judgeId":5,"hackId":47,"priority":3},{"id":88,"judgeId":5,"hackId":48,"priority":4},{"id":89,"judgeId":5,"hackId":49,"priority":5},{"id":90,"judgeId":5,"hackId":50,"priority":6},{"id":91,"judgeId":5,"hackId":51,"priority":7},{"id":92,"judgeId":5,"hackId":52,"priority":8},{"id":93,"judgeId":5,"hackId":53,"priority":9},{"id":94,"judgeId":5,"hackId":1,"priority":10},{"id":95,"judgeId":5,"hackId":2,"priority":11},{"id":96,"judgeId":5,"hackId":3,"priority":12},{"id":97,"judgeId":5,"hackId":4,"priority":13},{"id":98,"judgeId":5,"hackId":5,"priority":14},{"id":99,"judgeId":5,"hackId":6,"priority":15},{"id":100,"judgeId":5,"hackId":7,"priority":16},{"id":101,"judgeId":5,"hackId":8,"priority":17},{"id":102,"judgeId":5,"hackId":9,"priority":18},{"id":103,"judgeId":5,"hackId":10,"priority":19},{"id":104,"judgeId":5,"hackId":11,"priority":20},{"id":105,"judgeId":5,"hackId":12,"priority":21},{"id":106,"judgeId":5,"hackId":13,"priority":22}],"superlatives":[null,{"id":1,"name":"Horrible Terrible Bad and Disgusting"},{"id":2,"name":"Most Offensive"},{"id":3,"name":"Micky you suck"}],"superlativePlacements":[null,{"id":1,"judgeId":1,"superlativeId":1,"firstChoice":1,"secondChoice":0},{"id":2,"judgeId":1,"superlativeId":3,"firstChoice":4,"secondChoice":0}],"ratings":[null,{"id":1,"judgeId":1,"hackId":27,"rating":1},{"id":2,"judgeId":1,"hackId":31,"rating":11},{"id":3,"judgeId":1,"hackId":1,"rating":9},{"id":4,"judgeId":1,"hackId":28,"rating":-1},{"id":5,"judgeId":1,"hackId":4,"rating":9}]};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

(function () {
"use strict";

function toggleClass(toggle, onClass, offClass) {
    if ( toggle && onClass ) {
        return " "+onClass;
    } else if ( !toggle && offClass ) {
        return " "+offClass;
    } else {
        return "";
    }
}
window.toggleClass = toggleClass;

})();


/***/ }),
/* 11 */
/***/ (function(module, exports) {

(function (comps) {
"use strict";

var e = React.createElement;

//TODO: This indentation is a mess
class JudgeApp extends React.Component {
    constructor(props) {
        super(props);

        if ( props.hackOrdering.length === 0 ) {
            throw new Error("JudgeApp: Hackordering cannot be empty!");
        }

        this.state = {
            currentHackId: props.hackOrdering[0],
            listViewActive: false
        };
    }

    getCurrentHack() {
        return this.props.hacks[this.state.currentHackId];
    }

    getNextHackId() {
        let pos = this.props.hackPositions[this.state.currentHackId];
        if ( pos+1 >= this.props.hackOrdering.length ) {
            return null;
        } else {
            return this.props.hackOrdering[pos+1];
        }
    }

    getPrevHackId() {
        let pos = this.props.hackPositions[this.state.currentHackId];
        if ( pos-1 < 0 ) {
            return null;
        } else {
            return this.props.hackOrdering[pos-1];
        }
    }

    ////////////////////
    // Rendering

    getToolbarProps() {
        let prevHackId = this.getPrevHackId();
        let nextHackId = this.getNextHackId();
	let pos = this.props.hackPositions[this.state.currentHackId];
	let last = pos == this.props.hackOrdering.length-1;
	let first = pos==0;
        return {
            onPrev: () => {
                if (prevHackId) this.setState({currentHackId: prevHackId});
            },
            onList: () => {
		this.setState({listViewActive: !this.state.listViewActive})
	    },
            onNext: () => {
                if (nextHackId) this.setState({currentHackId: nextHackId});
            },
	    last,
	    first
        };
    }

    getJudgeProps() {
        return this.props.judgeInfo;
    }

    getProjectProps() {
	let rated = this.props.ratings[this.state.currentHackId]!==0;
        let props = Object.assign({rated},this.getCurrentHack());
	return props;
    }

    getRatingBoxProps() {
        return {
            chosen: this.props.ratings[this.state.currentHackId],
            hackId: this.state.currentHackId,
            onSubmit: r => sledge.sendRateHack({
                judgeId: this.props.myJudgeId,
                hackId: this.state.currentHackId,
                rating: r
            }),
        };
    }

    getSuperlativeProps() {
        let supers = this.props.superlatives.map( s => ({
            name: s.name,
            id: s.id,
            chosenFirstId: this.props.chosenSuperlatives[s.id].first,
            chosenSecondId: this.props.chosenSuperlatives[s.id].second
        }));

        return {
            superlatives: supers,
            hacks: this.props.hacks,
            currentHackId: this.state.currentHackId,
            onSubmit: (superId, choices) => {
                sledge.sendRankSuperlative({
                    judgeId: this.props.myJudgeId,
                    superlativeId: superId,
                    firstChoiceId: choices.first,
                    secondChoiceId: choices.second
                });
            }
        };
    }

    getProjectListProps() {
        return {
            hacks: this.props.hacks,
	    ratings: this.props.ratings,
            hackOrdering: this.props.hackOrdering,
            setHackId: hid =>
                this.setState({currentHackId: hid, listViewActive: false})
        };
    }

    render() {
        let currentHack = this.getCurrentHack();
	if ( this.state.listViewActive ) {
	    return e("div", { className: "container d-flex judge-container" },
                e(comps.Toolbar, this.getToolbarProps()),
                e(comps.JudgeInfo, this.getJudgeProps()),
                e(comps.ProjectList, this.getProjectListProps())
	    );
	} else {
            return e("div", { className: "container d-flex judge-container" },
                e(comps.Toolbar, this.getToolbarProps()),
                e(comps.JudgeInfo, this.getJudgeProps()),
                e(comps.Project, this.getProjectProps()),
                e(comps.RatingBox, this.getRatingBoxProps()),
                e(comps.Superlatives, this.getSuperlativeProps())
            );
	}
    }

}
comps.JudgeApp = JudgeApp;

})(window.comps || (window.comps = {}));


/***/ }),
/* 12 */
/***/ (function(module, exports) {

(function (comps) {
"use strict";

var e = React.createElement;

class JudgeInfo extends React.Component {
    render() {
        return e("div", { className: "judgeinfo-comp" },
            e("span", null,
                e("span", null, "Hello, "),
                e("span", { className: "judgeinfo-name" }, this.props.name),
                e("span", null, "!") )
        );
    }
}
comps.JudgeInfo = JudgeInfo;

})(window.comps || (window.comps = {}));


/***/ }),
/* 13 */
/***/ (function(module, exports) {

(function (comps) {
"use strict";

var e = React.createElement;

class Project extends React.Component {
    getNameAndLocation() {
        let nameAndLocation = this.props.name + " (Table "+this.props.location+")";
	if(this.props.rated){
	    nameAndLocation += " is rated";
	}
	return nameAndLocation;
    }

    render() {
        return e("div", { className: "project-comp" },
            e("h2", { className: "project-title" },
                this.getNameAndLocation() ),
            e("p", { className: "project-description" },
                this.props.description )
        );
    }
}
comps.Project = Project;

})(window.comps || (window.comps = {}));


/***/ }),
/* 14 */
/***/ (function(module, exports) {

(function (comps) {
"use strict";

var e = React.createElement;

class ProjectList extends React.Component {
    createListItem(hack) {
	return e(ProjectListElement, {
	    projectName: hack.name,
	    rated: this.props.ratings[hack.id] !== 0,
	    updateHackId: () => this.props.setHackId(hack.id)
	});
    }
    render(){
	var elements=this.props.hackOrdering.map( hid =>
        this.createListItem(this.props.hacks[hid]) )
	return e("div", {className: "list-view"},
	    e("ul", null,
	        ...elements));
    }
}
comps.ProjectList = ProjectList;

class ProjectListElement extends React.Component {
    render(){
	let className="list-item btn-primary";
	if(this.props.rated){
	    className="list-item btn-success"
	}
	return e("li", {
	    className,
	    onClick: this.props.updateHackId
	    },
	    this.props.projectName
	);
    }
}
comps.ProjectListElement = ProjectListElement;

})(window.comps || (window.comps = {}));


/***/ }),
/* 15 */
/***/ (function(module, exports) {

(function (comps) {
"use strict";

var e = React.createElement;

class RatingBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // TODO: These should probably be loaded from somewhere
            categories: [{
                name: "Egregiousness",
                selected: -1,
                dirty: true,
                id: 0
            }, {
                name: "Homeliness",
                selected: -1,
                dirty: true,
                id: 1
            }, {
                name: "Abhorentness",
                selected: -1,
                dirty: true,
                id: 2
            }, {
                name: "Inoperativeness",
                selected: -1,
                dirty: true,
                id: 3
            }],

            noshow: false
        };
    }

    componentWillReceiveProps(newProps) {
        // TODO: Is there a better way to do this? Maybe we shouldn't
        //       be so reliant on stateful components?
        if ( this.props.hackId !== newProps.hackId ) {
            this.reset();
        }
    }

    reset() {
        this.setState( (prevState, props) => {
            let cats = prevState.categories.slice(0);
            for (let cat of cats) {
                cat.dirty = true;
                cat.selected = -1;
            }
            return { categories: cats };
        });
    }

    select(catId, score) {
        this.setState( (prevState, props) => {
            let cats = prevState.categories.slice(0);
            cats[catId].selected = score;
            cats[catId].dirty = true;
            return { categories: cats };
        });
    }

    submit() {
        let selected = this.getSelected();
        if (!selected.valid) return;

        this.setState( (prevState, props) => {
            let cats = prevState.categories.slice(0);
            for (let cat of cats) {
                cat.dirty = false;
            }
            return { categories: cats };
        });

        this.props.onSubmit(selected.total);
    }

    getSelected() {
        let total = 0;
        let valid = true;

        if ( this.state.noshow ) {
            return {
                total: -1,
                valid: true
            };
        }

        for (let cat of this.state.categories) {
            if ( cat.selected >= 0 ) {
                total += cat.selected;
            } else {
                valid = false;
            }
        }

        if ( total <= 0 || 20 < total )
            valid = false;

        return { total, valid };
    }

    renderCategory(cat) {
        let buttons = [];
        for (let i=0;i<6;i++) {
            let selectedClass = i==cat.selected?" ratingbox-selected":"";
            buttons.push(
                e("button", {
                    className: "btn btn-primary"+selectedClass,
                    onClick: () => this.select(cat.id, i)
                }, i.toString())
            );
        }

        let dirtyClass = cat.dirty?" ratingbox-dirty":"";
        return e("div", { className: "ratingbox-category" },
            e("div", { className: "ratingbox-catname" },
                e("h3", null, cat.name)),
            e("div", { className: "btn-group"+dirtyClass },
                ...buttons)
        );
    }

    renderSelected() {
        let selected = this.getSelected();
        let validClass = toggleClass(selected.valid,
                "ratingbox-valid", "ratingbox-invalid");

        return e("span", {
            className: validClass
        }, selected.total >= 0 ? "Selected: " + selected.total.toString() : "no show");
    }

    renderChosen() {
        let total = this.props.chosen;

        let totalString;
        if ( total > 0 ) {
            totalString = "Current: " + total.toString();
        } else if ( total < 0 ) {
            totalString = "no show";
        } else {
            totalString = "unrated";
        }

        return e("span", null, totalString);
    }

    render() {
        let cats = [];
        if (!this.state.noshow)
            cats = this.state.categories.map( c => this.renderCategory(c) );

        return e("div", { className: "ratingbox-comp" },
            e("div", null,
                e("div", { className: "ratingbox-noshow" },
                    e("button", {
                        className: "btn btn-primary",
                        onClick: () => this.setState( (prevState, props) => ({ noshow: !prevState.noshow }) )
                    }, this.state.noshow?"Mark Hack as Present":"Mark Hack as No Show")),
                ...cats,
                e("div", { className: "ratingbox-summary" },
                    e("div", { className: "ratingbox-totalselected" },
                        e("span", null, this.renderSelected())),
                    e("div", { className: "ratingbox-totalchosen" },
                        e("span", null, this.renderChosen()))),
                e("div", { className: "ratingbox-submit" },
                    e("button", {
                        className: "btn btn-primary",
                        onClick: () => this.submit()
                    }, "SUBMIT")))
        );
    }
}
comps.RatingBox = RatingBox;

})(window.comps || (window.comps = {}));


/***/ }),
/* 16 */
/***/ (function(module, exports) {

(function (comps) {
"use strict";

var e = React.createElement;

class Superlatives extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: []
        };

        for (let s of props.superlatives) {
            this.state.selected[s.id] = {
                first: s.chosenFirstId,
                second: s.chosenSecondId
            };
        }
    }

    superlativesList() {
        let superElems = [];
        for (let superlative of this.props.superlatives) {
            superElems.push( this.superlativeViewer(superlative) );
        }

        return e("div", null, ...superElems);
    }

    getHackName(def, id) {
        if ( id < 1 ) {
            return def;
        } else {
            return this.props.hacks[id].name;
        }
    }

    getSelectedFirstId(superlativeId) {
        if ( this.state.selected[superlativeId] ) {
            return this.state.selected[superlativeId].first;
        } else {
            return 0;
        }
    }

    getSelectedSecondId(superlativeId) {
        if ( this.state.selected[superlativeId] ) {
            return this.state.selected[superlativeId].second;
        } else {
            return 0;
        }
    }

    initSelected(selected, superlativeId) {
        if (!selected[superlativeId]) {
            selected[superlativeId] = {
                first: 0,
                second: 0
            };
        }
    }

    selectFirst(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            this.initSelected(selected, superlativeId);

            if ( props.currentHackId === selected[superlativeId].second ) {
                selected[superlativeId].second = selected[superlativeId].first;
                selected[superlativeId].first = props.currentHackId;
            } else if ( props.currentHackId !== selected[superlativeId].first ) {
                selected[superlativeId].second = selected[superlativeId].first;
                selected[superlativeId].first = props.currentHackId;
            }

            return { selected };
        });
    }

    selectSecond(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            this.initSelected(selected, superlativeId);

            if ( props.currentHackId === selected[superlativeId].first ) {
                selected[superlativeId].first = selected[superlativeId].second;
                selected[superlativeId].second = props.currentHackId;
            } else {
                selected[superlativeId].second = props.currentHackId;
            }

            if ( selected[superlativeId].first === 0 ) {
                selected[superlativeId].first = selected[superlativeId].second;
                selected[superlativeId].second = 0;
            }

            return { selected };
        });
    }

    removeFirst(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            selected[superlativeId].first = selected[superlativeId].second;
            selected[superlativeId].second = 0;
            return { selected };
        });
    }

    removeSecond(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            selected[superlativeId].second = 0;
            return { selected };
        });
    }

    revert(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            let superlative = null;

            for (let s of props.superlatives) {
                if ( s.id === superlativeId ) superlative = s;
            }

            selected[superlativeId].first = superlative.chosenFirstId;
            selected[superlativeId].second = superlative.chosenSecondId;
        });
    }

    submit(superlativeId) {
        this.props.onSubmit(superlativeId, this.state.selected[superlativeId]);
    }

    superlativeViewer(s) {
        let selectedFirstId = this.getSelectedFirstId(s.id);
        let selectedSecondId = this.getSelectedSecondId(s.id);

        let selectedFirstName = this.getHackName("[NO FIRST PLACE]", selectedFirstId);
        let selectedSecondName = this.getHackName("[NO SECOND PLACE]", selectedSecondId);

        let dirtyFirstClass = (selectedFirstId === s.chosenFirstId)?"":" superlatives-dirty";
        let dirtySecondClass = (selectedSecondId === s.chosenSecondId)?"":" superlatives-dirty";

        return e("div", { className: "d-flex flex-column superlatives-item" },
            e("div", null,
                e("div", { className: "d-flex flex-row superlatives-info" },
                    e("div", { className: "superlatives-name" },
                        e("h3", null, s.name)),
                    e("div", { className: "superlatives-chosen" },
                        e("div", { className: "d-flex flex-column" },
                            e("div", { className: "superlatives-first"+dirtyFirstClass },
                                e("div", { className: "d-flex flex-row justify-content-end" },
                                    e("span", { className: "superlatives-hack" }, selectedFirstName),
                                    e("button", {
                                        className: "superlatives-remove",
                                        onClick: () => this.removeFirst(s.id)
                                    }, "X"))),
			    e("div", { className: "superlatives-second"+dirtySecondClass },
                                e("div", { className: "d-flex flex-row justify-content-end" },
                                    e("span", { className: "superlatives-hack" }, selectedSecondName),
                                    e("button", {
                                        className: "superlative-remove",
                                        onClick: () => this.removeSecond(s.id)
                                    }, "X"))))))),
            e("div", { className: "superlatives-actions" },
	        e("div", { className: "row" },
                    e("div", { className: "btn-group col-md-6 btn-group-justified" },
                        e("button", {
                            className: "btn btn-primary superlatives-btn-first",
                            onClick: () => this.selectFirst(s.id)
			}, "FIRST"),
                        e("button", {
                            className: "btn btn-primary superlatives-btn-second",
                            onClick: () => this.selectSecond(s.id)
			}, "SECOND")),
	            e("div", { className: "btn-group col-md-6 btn-group-justified" },
                        e("button", {
                            className: "btn btn-primary superlatives-btn-revert",
                            onClick: () => this.revert(s.id)
			}, "REVERT"),
                        e("button", {
                            className: "btn btn-primary superlatives-btn-submit",
                            onClick: () => this.submit(s.id)
			}, "SUBMIT"))))
        );
    }

    render() {
        return e("div", { className: "superlatives-comp" },
            e("h2", null, "Superlatives"),
            e("div", { className: "superlatives-list" },
                this.superlativesList() )
        );
    }
}
comps.Superlatives = Superlatives;

})(window.comps || (window.comps = {}));


/***/ }),
/* 17 */
/***/ (function(module, exports) {

(function (comps) {
"use strict";

var e = React.createElement;

class Toolbar extends React.Component {
    buttonClassName(disable) {
	if (disable) {
	    return  "btn btn-primary toolbar-prev disabled toolbar-no-text"
	} else {
	    return "btn btn-primary toolbar-prev"
	}
    }
    render() {
        return e("div", { className: "toolbar-comp" },
            e("div", { className: "toolbar-title" },
                e("h1", null,
                    "SLEDGE" ) ),
            e("div", { className: "btn-group toolbar-buttons"},
                e("button", {
                    className: this.buttonClassName(this.props.first),
                    onClick: this.props.onPrev
                }, "<--"),
                e("button", {
                    className: "btn btn-primary toolbar-list",
                    onClick: this.props.onList
                }, "LIST"),
                e("button", {
                    className: this.buttonClassName(this.props.last),
                    onClick: this.props.onNext
                }, "-->") )
        );
    }
}
comps.Toolbar = Toolbar;

})(window.comps || (window.comps = {}));


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(19);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(21)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./global.scss", function() {
		var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./global.scss");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(20)(false);
// imports
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Mr+Dafoe);", ""]);
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Titillium+Web:900);", ""]);
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Righteous);", ""]);
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Candal);", ""]);
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Permanent+Marker);", ""]);
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Monoton);", ""]);

// module
exports.push([module.i, "#adminPage #log {\n  width: 100%;\n  height: 500px;\n  font-family: \"Lucida Console\", Monaco, monospace; }\n\n#adminPage #cmd {\n  width: 100%; }\n\n#loginForm {\n  margin: 10px;\n  color: white; }\n\n.login-container {\n  border: solid 5px;\n  border-radius: 5px;\n  border-color: black;\n  background-color: #19C0E7;\n  padding: 15px; }\n\nbody {\n  margin: 35px; }\n\n#loginForm button {\n  width: 100%;\n  padding: 10px;\n  margin: 10px 0px; }\n\n.hidden {\n  display: none; }\n\n.sledge-primary {\n  color: white;\n  background-color: #80935e; }\n\n.sledge-secondary {\n  color: #80935e;\n  background-color: #dbd9b1; }\n\n@media screen and (max-width: 468px) {\n  .start {\n    display: none; } }\n\n#message {\n  color: white;\n  text-shadow: 0.5px 0.5px #000000; }\n\n/********************\n * Overall\n */\n.judge-container {\n  flex-direction: column;\n  border: solid 5px;\n  border-radius: 5px;\n  border-color: black;\n  background-color: #19C0E7;\n  color: white; }\n\n/********************\n * Colors\n */\n.sledge-primary {\n  border-color: #80935e;\n  color: white;\n  background-color: #80935e; }\n\n.sledge-secondary {\n  border-color: #dbd9b1;\n  color: #80935e;\n  background-color: #dbd9b1; }\n\n/*\n.sledge-secondary:hover {\n    border-color: #dbd9b1;\n    color: #80935e;\n    background-color: #dbd9b1;\n}*/\n/********************\n * Media Query Misc\n */\n/* TODO: We're fighting Bootstrap with these 'important' tags,\n *       maybe it would be better to not use Bootstrap classes\n *       tagged w/ important.\n */\n@media (max-width: 420px) {\n  .toolbar-title {\n    display: none; }\n  .toolbar-buttons {\n    width: 100%; }\n  .superlatives-info {\n    flex-direction: column !important; }\n  .superlatives-first div, .superlatives-second div {\n    display: flex;\n    justify-content: space-between !important; }\n  .superlatives-chosen {\n    width: 100%; } }\n\n/*\n * ratingbox.css\n */\n.ratingbox-comp button {\n  height: 80px;\n  cursor: pointer; }\n\n.ratingbox-noshow {\n  text-align: center; }\n\n.ratingbox-noshow button {\n  width: 180 px; }\n\n@media screen and (min-width: 400px) {\n  .ratingbox-noshow button {\n    width: 60%; } }\n\n.ratingbox-catname {\n  text-align: center;\n  font-weight: bold;\n  font-size: 30px;\n  color: white; }\n\n.ratingbox-comp .btn-group {\n  padding: 10px;\n  width: 100%; }\n\n.ratingbox-category button {\n  width: 16.66%; }\n\n.ratingbox-selected {\n  background: green; }\n\n.ratingbox-dirty .ratingbox-selected {\n  background: yellow; }\n\n.ratingbox-summary {\n  width: 100%;\n  font-size: 25px;\n  text-align: center; }\n\n.ratingbox-totalselected {\n  float: left;\n  width: 50%; }\n\n.ratingbox-totalchosen {\n  float: right;\n  width: 50%; }\n\n.ratingbox-totalselected .ratingbox-invalid {\n  color: red;\n  text-shadow: 1px 1px #000000; }\n\n.ratingbox-submit button {\n  width: 100%; }\n\n/*\n * toolbar.css\n */\n.toolbar-comp {\n  display: flex;\n  width: 100%;\n  padding: 20px; }\n\n.toolbar-title {\n  width: 30%;\n  text-align: center;\n  margin: auto auto; }\n\n.toolbar-title h1 {\n  font-family: Helvetica Neue, Helvetica;\n  font-size: 24px; }\n\n.toolbar-buttons button {\n  cursor: pointer; }\n\n.toolbar-no-text {\n  color: #007bff; }\n\n.toolbar-no-text:hover {\n  color: #007bff; }\n\n/*\n * judgeinfo.css\n */\n.judgeinfo-comp {\n  margin: 10px auto;\n  color: white;\n  font-weight: bold;\n  text-shadow: 0.5px 0.5px #000000;\n  text-align: center;\n  font-size: 40px; }\n\n.judgeinfo-name {\n  font-weight: bold;\n  color: white;\n  text-shadow: 0.5px 0.5px #000000;\n  text-align: center;\n  font-size: 40px; }\n\n@media screen and (min-width: 468px) and (max-width: 768px) {\n  .judgeinfo-comp {\n    font-size: 50px; }\n  .judgeinfo-name {\n    font-size: 50px; } }\n\n@media screen and (min-width: 200px) and (max-width: 467px) {\n  .judgeinfo-comp {\n    font-size: 25px; }\n  .judgeinfo-name {\n    font-size: 25px; } }\n\n@media screen and (min-width: 0px) and (max-width: 199px) {\n  .judgeinfo-comp {\n    font-size: 25px; }\n  .judgeinfo-name {\n    font-size: 25px; } }\n\n/*\n * projectlist.css\n */\n.list-view {\n  margin: 15px; }\n\n.list-view ul {\n  padding: 0;\n  list-style-type: none;\n  color: white; }\n\n.list-item {\n  margin: 0px 0px 5px 0px;\n  color: white; }\n\n/*\n * superlatives.css\n */\n.superlatives-comp {\n  margin: 15px; }\n\n.superlatives-comp h2 {\n  text-align: center;\n  color: #ffffff; }\n\n.superlatives-name {\n  width: 110px;\n  color: #ffffff; }\n\n@media screen and (max-width: 420px) and (min-screen: 0px) {\n  .superlatives-name {\n    font-size: 30px; } }\n\n/*@media screen and (min-width:484px){\n    width: 38%;\n}*/\n.superlatives-chosen {\n  width: 62%; }\n\n@media screen and (max-width: 425px) {\n  .superlatives-chosen {\n    width: 38%; } }\n\n.superlatives-item {\n  margin: 15px 10px;\n  padding: 10px;\n  border-left: 10px solid #000; }\n\n.superlatives-actions {\n  width: 100%; }\n\n.superlatives-dirty {\n  font-style: italic; }\n\n.superlatives-actions .btn-group {\n  width: 100%; }\n\n.superlatives-actions .btn {\n  width: 79px;\n  height: 80px;\n  cursor: pointer; }\n\n@media screen and (min-width: 484px) {\n  .superlatives-actions .btn {\n    width: 50%; } }\n\n/*\n * project.css\n */\n.project-comp {\n  margin: 15px;\n  color: white;\n  text-shadow: 0.5px 0.5px #000000;\n  text-align: center; }\n\n@media screen and (max-width: 600px) {\n  .project-title {\n    font-size: 20px; } }\n\n@media screen and (max-width: 600px) {\n  .project-title {\n    font-size: 18px; } }\n\n@media screen and (max-width: 400px) {\n  .project-title {\n    font-size: 16px; } }\n\n@media screen and (max-width: 339px) {\n  .project-title {\n    font-size: 12px; } }\n\n.project-description {\n  text-indent: 10px;\n  color: white; }\n\n@media screen and (min-width: 800px) {\n  .project-title {\n    font-size: 20px; } }\n", ""]);

// exports


/***/ }),
/* 20 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(22);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 22 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2YyNjIxNzdmZTE4MDQxNjMxMzEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9lbnRyeS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L3NsZWRnZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L3V0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9jbGllbnQvcGFnZXMvYWRtaW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9wYWdlcy9qdWRnZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L3BhZ2VzL2xvZ2luLmpzIiwid2VicGFjazovLy8uL3NyYy9jbGllbnQvcGFnZXMvcmVzdWx0cy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L3BhZ2VzL3NsZWRnZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L3BhZ2VzL3Rlc3RkYXRhLmpzIiwid2VicGFjazovLy8uL3NyYy9jbGllbnQvcGFnZXMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jb21wb25lbnRzL2p1ZGdlYXBwLmpzIiwid2VicGFjazovLy8uL3NyYy9jbGllbnQvY29tcG9uZW50cy9qdWRnZWluZm8uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jb21wb25lbnRzL3Byb2plY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jb21wb25lbnRzL3Byb2plY3RsaXN0LmpzIiwid2VicGFjazovLy8uL3NyYy9jbGllbnQvY29tcG9uZW50cy9yYXRpbmdib3guanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jb21wb25lbnRzL3N1cGVybGF0aXZlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L2NvbXBvbmVudHMvdG9vbGJhci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L2dsb2JhbC5zY3NzPzFmYWYiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9nbG9iYWwuc2NzcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDN0RBO0FBQ0EsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3hCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBbUI7QUFDbkIsb0JBQW9CO0FBQ3BCLHdCQUF3QjtBQUN4QiwwQkFBMEI7QUFDMUIsbUNBQW1DO0FBQ25DLHFCQUFxQjtBQUNyQjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztB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TDtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDOzs7Ozs7O0FDZEQ7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsZUFBZTtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixZQUFZLHVDQUF1Qzs7O0FBR3pFO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBbUIsdUJBQXVCO0FBQzFDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxDQUFDOztBQUVELENBQUMsNENBQTRDOzs7Ozs7O0FDelQ3QztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wscUJBQXFCLE1BQU07QUFDM0I7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLDRDQUE0Qzs7Ozs7OztBQzVHN0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELFFBQVE7O0FBRXhEO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULHFCQUFxQixxQ0FBcUM7QUFDMUQsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsdURBQXVELEdBQUc7QUFDMUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esb0VBQW9FLEdBQUc7QUFDdkU7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLHdDQUF3Qzs7Ozs7OztBQy9JekM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUIsU0FBUztBQUM1Qix1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsK0JBQStCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixnQkFBZ0I7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQixlQUFlO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFCQUFxQixnQkFBZ0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsWUFBWTtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQixlQUFlO0FBQ2hDO0FBQ0E7QUFDQSxxQkFBcUIsWUFBWTtBQUNqQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxDQUFDLGdEQUFnRDs7Ozs7OztBQ3ZMakQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbUJBQW1CO0FBQ25CLG9CQUFvQjtBQUNwQix3QkFBd0I7QUFDeEIsMEJBQTBCO0FBQzFCLG1DQUFtQztBQUNuQyxxQkFBcUI7QUFDckI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZUFBZSxrQ0FBa0M7QUFDakQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxlQUFlLDZDQUE2QztBQUM1RDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsZUFBZSxtREFBbUQ7QUFDbEU7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUEsNEJBQTRCLElBQUk7QUFDaEMsbUNBQW1DLElBQUk7QUFDdkM7QUFDQTtBQUNBOztBQUVBLHVCQUF1QixZQUFZO0FBQ25DLDhCQUE4QixZQUFZO0FBQzFDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCQUE2QixLQUFLO0FBQ2xDLG9DQUFvQyxLQUFLO0FBQ3pDO0FBQ0E7QUFDQTs7QUFFQSx1QkFBdUIsZ0JBQWdCO0FBQ3ZDLDhCQUE4QixnQkFBZ0I7QUFDOUM7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixnQkFBZ0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSx1QkFBdUIsd0JBQXdCO0FBQy9DO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCLFFBQVE7QUFDL0I7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixRQUFRO0FBQ2hDOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUJBQWlCLGVBQWU7QUFDaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQixzQkFBc0I7QUFDdkM7QUFDQSxxQkFBcUIsdUJBQXVCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLDBCQUEwQixRQUFRO0FBQ2xDOztBQUVBOztBQUVBLGlCQUFpQixzQkFBc0I7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQixzQkFBc0I7QUFDdkM7QUFDQSxxQkFBcUIsNkJBQTZCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsZ0NBQWdDLFFBQVE7QUFDeEM7O0FBRUE7O0FBRUE7QUFDQSxpQkFBaUIsNkJBQTZCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsZ0RBQWdEOztBQUVqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxDQUFDLHNDQUFzQzs7Ozs7OztBQ25XdkMsd0JBQXdCLGVBQWUsOEtBQThLLEVBQUUsOEtBQThLLEVBQUUsd0lBQXdJLEVBQUUsa0VBQWtFLEVBQUUsMkpBQTJKLEVBQUUsNElBQTRJLEVBQUUsOEhBQThILEVBQUUsaUtBQWlLLEVBQUUsMEhBQTBILEVBQUUsK0tBQStLLEVBQUUsbUtBQW1LLEVBQUUsaUhBQWlILEVBQUUsbUhBQW1ILEVBQUUsbUdBQW1HLEVBQUUsNEZBQTRGLEVBQUUseUlBQXlJLEVBQUUsd0tBQXdLLEVBQUUseUZBQXlGLEVBQUUsbUlBQW1JLEVBQUUsdUhBQXVILEVBQUUsOEpBQThKLEVBQUUsNEVBQTRFLEVBQUUsOEZBQThGLEVBQUUsa0xBQWtMLEVBQUUsOEtBQThLLEVBQUUseUlBQXlJLEVBQUUsb0xBQW9MLEVBQUUsdUtBQXVLLEVBQUUsK0hBQStILEVBQUUsd0tBQXdLLEVBQUUsa01BQWtNLEVBQUUsK0lBQStJLEVBQUUsMEhBQTBILEVBQUUsaUtBQWlLLEVBQUUsdUxBQXVMLEVBQUUsK0tBQStLLEVBQUUsOElBQThJLEVBQUUsd0dBQXdHLEVBQUUseUlBQXlJLEVBQUUscUhBQXFILEVBQUUsc0lBQXNJLEVBQUUsMExBQTBMLEVBQUUsd0dBQXdHLEVBQUUsa0xBQWtMLEVBQUUsNkhBQTZILEVBQUUsK0pBQStKLEVBQUUsMEZBQTBGLEVBQUUsOExBQThMLEVBQUUsZ0xBQWdMLEVBQUUsbUtBQW1LLEVBQUUsOEdBQThHLEVBQUUsbUlBQW1JLEVBQUUsdUhBQXVILGtCQUFrQixtREFBbUQsRUFBRSx5Q0FBeUMsRUFBRSx5Q0FBeUMsRUFBRSx5Q0FBeUMsRUFBRSx5Q0FBeUMsc0JBQXNCLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLDZDQUE2QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDZDQUE2QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLDhDQUE4QyxFQUFFLCtDQUErQyxFQUFFLCtDQUErQyxFQUFFLCtDQUErQyxFQUFFLCtDQUErQyx3QkFBd0IscURBQXFELEVBQUUsK0JBQStCLEVBQUUsK0JBQStCLGlDQUFpQyxzRUFBc0UsRUFBRSxzRUFBc0UsbUJBQW1CLDBDQUEwQyxFQUFFLDJDQUEyQyxFQUFFLHlDQUF5QyxFQUFFLDJDQUEyQyxFQUFFLHlDQUF5Qzs7Ozs7OztBQ0ExbmE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQzs7Ozs7OztBQ2REO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLDBCQUEwQjtBQUN6RSxhQUFhO0FBQ2I7QUFDQSxpQkFBaUIsMkNBQTJDO0FBQzVELE1BQU07QUFDTjtBQUNBLCtDQUErQywwQkFBMEI7QUFDekUsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUNBQW1DLE1BQU07QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLDBDQUEwQztBQUN6RTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixnREFBZ0Q7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0YsNkJBQTZCLGdEQUFnRDtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsQ0FBQyxvQ0FBb0M7Ozs7Ozs7QUMvSXJDO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHlCQUF5Qiw4QkFBOEI7QUFDdkQ7QUFDQTtBQUNBLDJCQUEyQiw4QkFBOEI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLG9DQUFvQzs7Ozs7OztBQ2pCckM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUJBQXlCLDRCQUE0QjtBQUNyRCxxQkFBcUIsNkJBQTZCO0FBQ2xEO0FBQ0Esb0JBQW9CLG1DQUFtQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUMsb0NBQW9DOzs7Ozs7O0FDekJyQztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQix1QkFBdUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLG9DQUFvQzs7Ozs7OztBQ3ZDckM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGdCQUFnQjtBQUNoQjs7QUFFQTtBQUNBO0FBQ0EscUJBQXFCLElBQUk7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBOztBQUVBO0FBQ0EseUJBQXlCLGtDQUFrQztBQUMzRCxzQkFBc0IsaUNBQWlDO0FBQ3ZEO0FBQ0Esc0JBQXNCLG9DQUFvQztBQUMxRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEseUJBQXlCLDhCQUE4QjtBQUN2RDtBQUNBLDBCQUEwQixnQ0FBZ0M7QUFDMUQ7QUFDQTtBQUNBLDhFQUE4RSw0QkFBNEI7QUFDMUcscUJBQXFCO0FBQ3JCO0FBQ0EsMEJBQTBCLGlDQUFpQztBQUMzRCw4QkFBOEIsdUNBQXVDO0FBQ3JFO0FBQ0EsOEJBQThCLHFDQUFxQztBQUNuRTtBQUNBLDBCQUEwQixnQ0FBZ0M7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUMsb0NBQW9DOzs7Ozs7O0FDbkxyQztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0I7QUFDcEIsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG9CQUFvQjtBQUNwQixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHlCQUF5QixvREFBb0Q7QUFDN0U7QUFDQSwwQkFBMEIsaURBQWlEO0FBQzNFLDhCQUE4QixpQ0FBaUM7QUFDL0Q7QUFDQSw4QkFBOEIsbUNBQW1DO0FBQ2pFLGtDQUFrQyxrQ0FBa0M7QUFDcEUsc0NBQXNDLGtEQUFrRDtBQUN4RiwwQ0FBMEMsbURBQW1EO0FBQzdGLCtDQUErQyxpQ0FBaUM7QUFDaEY7QUFDQTtBQUNBO0FBQ0EscUNBQXFDO0FBQ3JDLGlCQUFpQixvREFBb0Q7QUFDckUsMENBQTBDLG1EQUFtRDtBQUM3RiwrQ0FBK0MsaUNBQWlDO0FBQ2hGO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQztBQUNyQyxzQkFBc0Isb0NBQW9DO0FBQzFELG1CQUFtQixtQkFBbUI7QUFDdEMsOEJBQThCLHNEQUFzRDtBQUNwRjtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLHVCQUF1QixzREFBc0Q7QUFDN0U7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0EseUJBQXlCLGlDQUFpQztBQUMxRDtBQUNBLHNCQUFzQixpQ0FBaUM7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLG9DQUFvQzs7Ozs7OztBQ3hNckM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qiw0QkFBNEI7QUFDckQsc0JBQXNCLDZCQUE2QjtBQUNuRDtBQUNBO0FBQ0Esc0JBQXNCLHdDQUF3QztBQUM5RDtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLG9DQUFvQzs7Ozs7Ozs7QUNuQ3JDOztBQUVBOztBQUVBO0FBQ0E7Ozs7QUFJQSxlQUFlOztBQUVmO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFHOztBQUVIOztBQUVBO0FBQ0EsRUFBRTs7QUFFRixnQ0FBZ0MsVUFBVSxFQUFFO0FBQzVDLEM7Ozs7OztBQzVDQTtBQUNBO0FBQ0EsdUZBQXdGO0FBQ3hGLGdHQUFpRztBQUNqRyx3RkFBeUY7QUFDekYscUZBQXNGO0FBQ3RGLCtGQUFnRztBQUNoRyxzRkFBdUY7O0FBRXZGO0FBQ0EsMENBQTJDLGdCQUFnQixrQkFBa0IsdURBQXVELEVBQUUscUJBQXFCLGdCQUFnQixFQUFFLGdCQUFnQixpQkFBaUIsaUJBQWlCLEVBQUUsc0JBQXNCLHNCQUFzQix1QkFBdUIsd0JBQXdCLDhCQUE4QixrQkFBa0IsRUFBRSxVQUFVLGlCQUFpQixFQUFFLHVCQUF1QixnQkFBZ0Isa0JBQWtCLHFCQUFxQixFQUFFLGFBQWEsa0JBQWtCLEVBQUUscUJBQXFCLGlCQUFpQiw4QkFBOEIsRUFBRSx1QkFBdUIsbUJBQW1CLDhCQUE4QixFQUFFLDBDQUEwQyxZQUFZLG9CQUFvQixFQUFFLEVBQUUsY0FBYyxpQkFBaUIscUNBQXFDLEVBQUUsOERBQThELDJCQUEyQixzQkFBc0IsdUJBQXVCLHdCQUF3Qiw4QkFBOEIsaUJBQWlCLEVBQUUsNERBQTRELDBCQUEwQixpQkFBaUIsOEJBQThCLEVBQUUsdUJBQXVCLDBCQUEwQixtQkFBbUIsOEJBQThCLEVBQUUsaUNBQWlDLDRCQUE0QixxQkFBcUIsZ0NBQWdDLEdBQUcsb1BBQW9QLG9CQUFvQixvQkFBb0IsRUFBRSxzQkFBc0Isa0JBQWtCLEVBQUUsd0JBQXdCLHdDQUF3QyxFQUFFLHVEQUF1RCxvQkFBb0IsZ0RBQWdELEVBQUUsMEJBQTBCLGtCQUFrQixFQUFFLEVBQUUsdURBQXVELGlCQUFpQixvQkFBb0IsRUFBRSx1QkFBdUIsdUJBQXVCLEVBQUUsOEJBQThCLGtCQUFrQixFQUFFLDBDQUEwQyw4QkFBOEIsaUJBQWlCLEVBQUUsRUFBRSx3QkFBd0IsdUJBQXVCLHNCQUFzQixvQkFBb0IsaUJBQWlCLEVBQUUsZ0NBQWdDLGtCQUFrQixnQkFBZ0IsRUFBRSxnQ0FBZ0Msa0JBQWtCLEVBQUUseUJBQXlCLHNCQUFzQixFQUFFLDBDQUEwQyx1QkFBdUIsRUFBRSx3QkFBd0IsZ0JBQWdCLG9CQUFvQix1QkFBdUIsRUFBRSw4QkFBOEIsZ0JBQWdCLGVBQWUsRUFBRSw0QkFBNEIsaUJBQWlCLGVBQWUsRUFBRSxpREFBaUQsZUFBZSxpQ0FBaUMsRUFBRSw4QkFBOEIsZ0JBQWdCLEVBQUUsNENBQTRDLGtCQUFrQixnQkFBZ0Isa0JBQWtCLEVBQUUsb0JBQW9CLGVBQWUsdUJBQXVCLHNCQUFzQixFQUFFLHVCQUF1QiwyQ0FBMkMsb0JBQW9CLEVBQUUsNkJBQTZCLG9CQUFvQixFQUFFLHNCQUFzQixtQkFBbUIsRUFBRSw0QkFBNEIsbUJBQW1CLEVBQUUsZ0RBQWdELHNCQUFzQixpQkFBaUIsc0JBQXNCLHFDQUFxQyx1QkFBdUIsb0JBQW9CLEVBQUUscUJBQXFCLHNCQUFzQixpQkFBaUIscUNBQXFDLHVCQUF1QixvQkFBb0IsRUFBRSxpRUFBaUUscUJBQXFCLHNCQUFzQixFQUFFLHFCQUFxQixzQkFBc0IsRUFBRSxFQUFFLGlFQUFpRSxxQkFBcUIsc0JBQXNCLEVBQUUscUJBQXFCLHNCQUFzQixFQUFFLEVBQUUsK0RBQStELHFCQUFxQixzQkFBc0IsRUFBRSxxQkFBcUIsc0JBQXNCLEVBQUUsRUFBRSw2Q0FBNkMsaUJBQWlCLEVBQUUsbUJBQW1CLGVBQWUsMEJBQTBCLGlCQUFpQixFQUFFLGdCQUFnQiw0QkFBNEIsaUJBQWlCLEVBQUUsc0RBQXNELGlCQUFpQixFQUFFLDJCQUEyQix1QkFBdUIsbUJBQW1CLEVBQUUsd0JBQXdCLGlCQUFpQixtQkFBbUIsRUFBRSxnRUFBZ0Usd0JBQXdCLHNCQUFzQixFQUFFLEVBQUUsMENBQTBDLGlCQUFpQixHQUFHLDBCQUEwQixlQUFlLEVBQUUsMENBQTBDLDBCQUEwQixpQkFBaUIsRUFBRSxFQUFFLHdCQUF3QixzQkFBc0Isa0JBQWtCLGlDQUFpQyxFQUFFLDJCQUEyQixnQkFBZ0IsRUFBRSx5QkFBeUIsdUJBQXVCLEVBQUUsc0NBQXNDLGdCQUFnQixFQUFFLGdDQUFnQyxnQkFBZ0IsaUJBQWlCLG9CQUFvQixFQUFFLDBDQUEwQyxnQ0FBZ0MsaUJBQWlCLEVBQUUsRUFBRSw0Q0FBNEMsaUJBQWlCLGlCQUFpQixxQ0FBcUMsdUJBQXVCLEVBQUUsMENBQTBDLG9CQUFvQixzQkFBc0IsRUFBRSxFQUFFLDBDQUEwQyxvQkFBb0Isc0JBQXNCLEVBQUUsRUFBRSwwQ0FBMEMsb0JBQW9CLHNCQUFzQixFQUFFLEVBQUUsMENBQTBDLG9CQUFvQixzQkFBc0IsRUFBRSxFQUFFLDBCQUEwQixzQkFBc0IsaUJBQWlCLEVBQUUsMENBQTBDLG9CQUFvQixzQkFBc0IsRUFBRSxFQUFFOztBQUVweUw7Ozs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLGdCQUFnQjtBQUNuRCxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGlCQUFpQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksb0JBQW9CO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCxjQUFjOztBQUVsRTtBQUNBOzs7Ozs7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLGlCQUFpQixtQkFBbUI7QUFDcEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLHNCQUFzQjtBQUN2Qzs7QUFFQTtBQUNBLG1CQUFtQiwyQkFBMkI7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IsbUJBQW1CO0FBQ25DO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxpQkFBaUIsMkJBQTJCO0FBQzVDO0FBQ0E7O0FBRUEsUUFBUSx1QkFBdUI7QUFDL0I7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQSxpQkFBaUIsdUJBQXVCO0FBQ3hDO0FBQ0E7O0FBRUEsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsZ0JBQWdCLGlCQUFpQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYzs7QUFFZCxrREFBa0Qsc0JBQXNCO0FBQ3hFO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7O0FBRUEsNkJBQTZCLG1CQUFtQjs7QUFFaEQ7O0FBRUE7O0FBRUE7QUFDQTs7Ozs7Ozs7QUMxWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFdBQVcsRUFBRTtBQUNyRCx3Q0FBd0MsV0FBVyxFQUFFOztBQUVyRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLHNDQUFzQztBQUN0QyxHQUFHO0FBQ0g7QUFDQSw4REFBOEQ7QUFDOUQ7O0FBRUE7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGNmMjYyMTc3ZmUxODA0MTYzMTMxIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5yZXF1aXJlKFwiLi9zbGVkZ2UuanNcIik7XG5yZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcbnJlcXVpcmUoXCIuL3BhZ2VzL2FkbWluLmpzXCIpO1xucmVxdWlyZShcIi4vcGFnZXMvanVkZ2UuanNcIik7XG5yZXF1aXJlKFwiLi9wYWdlcy9sb2dpbi5qc1wiKTtcbnJlcXVpcmUoXCIuL3BhZ2VzL3Jlc3VsdHMuanNcIik7XG5yZXF1aXJlKFwiLi9wYWdlcy9zbGVkZ2UuanNcIik7XG5yZXF1aXJlKFwiLi9wYWdlcy90ZXN0ZGF0YS5qc1wiKTtcbnJlcXVpcmUoXCIuL3BhZ2VzL3V0aWxzLmpzXCIpO1xucmVxdWlyZShcIi4vY29tcG9uZW50cy9qdWRnZWFwcC5qc1wiKTtcbnJlcXVpcmUoXCIuL2NvbXBvbmVudHMvanVkZ2VpbmZvLmpzXCIpO1xucmVxdWlyZShcIi4vY29tcG9uZW50cy9wcm9qZWN0LmpzXCIpO1xucmVxdWlyZShcIi4vY29tcG9uZW50cy9wcm9qZWN0bGlzdC5qc1wiKTtcbnJlcXVpcmUoXCIuL2NvbXBvbmVudHMvcmF0aW5nYm94LmpzXCIpO1xucmVxdWlyZShcIi4vY29tcG9uZW50cy9zdXBlcmxhdGl2ZXMuanNcIik7XG5yZXF1aXJlKFwiLi9jb21wb25lbnRzL3Rvb2xiYXIuanNcIik7XG5sZXQgdyA9IHdpbmRvdztcbmlmICh3LnBhZ2VzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUHJvcGVydHkgd2luZG93LnBhZ2VzIGFscmVhZHkgZXhpc3RzLlwiKTtcbn1cbmVsc2Uge1xuICAgIHcucGFnZXMgPSB7fTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NsaWVudC9lbnRyeS50c1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKHNsZWRnZSkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzb2NrZXQgPSBudWxsO1xudmFyIHN1YnNjcmliZXJzID0gW107XG52YXIgaGFuZGxlcnMgPSBbXTtcbnZhciBpbml0aWFsaXplZCA9IGZhbHNlO1xuXG5zbGVkZ2UuX3NvY2tldCA9ICgpID0+IHNvY2tldDtcbnNsZWRnZS5fc3Vic2NyaWJlcnMgPSBzdWJzY3JpYmVycztcbnNsZWRnZS5faGFuZGxlcnMgPSBoYW5kbGVycztcbnNsZWRnZS5faW5pdGlhbGl6ZWQgPSAoKSA9PiBpbml0aWFsaXplZDtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEdsb2JhbCBUYWJsZXNcblxudmFyIHRhYmxlcyA9IHtcbiAgICBoYWNrczogW10sIC8vIHtpZCwgbmFtZSwgZGVzY3JpcHRpb24sIGxvY2F0aW9ufVxuICAgIGp1ZGdlczogW10sIC8vIHtpZCwgbmFtZSwgZW1haWx9XG4gICAganVkZ2VIYWNrczogW10sIC8vIHtpZCwganVkZ2VJZCwgaGFja0lkLCBwcmlvcml0eX1cbiAgICBzdXBlcmxhdGl2ZXM6IFtdLCAvLyB7aWQsIG5hbWV9XG4gICAgc3VwZXJsYXRpdmVQbGFjZW1lbnRzOiBbXSwgLy8ge2lkLCBqdWRnZUlkLCBzdXBlcmxhdGl2ZUlkLCBmaXJzdENob2ljZSwgc2Vjb25kQ2hvaWNlfVxuICAgIHJhdGluZ3M6IFtdLCAvLyB7aWQsIGp1ZGdlSWQsIGhhY2tJZCwgcmF0aW5nfVxufTtcbnNsZWRnZS5fdGFibGVzID0gdGFibGVzO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUHJpdmF0ZSBIZWxwZXJzXG5cbmZ1bmN0aW9uIHVwZGF0ZVRhYmxlcyhkYXRhKSB7XG4gICAgZm9yICggbGV0IHRhYmxlIG9mIE9iamVjdC5rZXlzKHRhYmxlcykgKSB7XG4gICAgICAgIGlmICggZGF0YVt0YWJsZV0gKSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgcm93IG9mIGRhdGFbdGFibGVdICkge1xuICAgICAgICAgICAgICAgIGlmICggcm93ICYmIHJvdy5pZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVzW3RhYmxlXVtyb3cuaWRdID0gcm93O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbnNsZWRnZS5fdXBkYXRlVGFibGVzID0gdXBkYXRlVGFibGVzO1xuXG5mdW5jdGlvbiBzZW5kQ2hhbmdlKGNvbnRlbnQpIHtcbiAgICBmb3IgKGxldCBzdWIgb2Ygc3Vic2NyaWJlcnMpXG4gICAgICAgIGlmIChzdWIpIHN1Yihjb250ZW50KTtcbn1cbnNsZWRnZS5fc2VuZENoYW5nZSA9IHNlbmRDaGFuZ2U7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBVcGRhdGUgSGFuZGxlcnNcblxuZnVuY3Rpb24gb25FcnJvcihkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJFcnJvclwiLCBkYXRhKTtcbn1cbmhhbmRsZXJzLnB1c2goeyBuYW1lOiBcImVycm9yXCIsIGhhbmRsZXI6IG9uRXJyb3IgfSk7XG5zbGVkZ2UuX29uRXJyb3IgPSBvbkVycm9yO1xuXG5mdW5jdGlvbiBvblVwZGF0ZUZ1bGwoZGF0YSkge1xuICAgIHRhYmxlcy5oYWNrcy5zcGxpY2UoMCk7XG4gICAgdGFibGVzLmp1ZGdlcy5zcGxpY2UoMCk7XG4gICAgdGFibGVzLmp1ZGdlSGFja3Muc3BsaWNlKDApO1xuICAgIHRhYmxlcy5zdXBlcmxhdGl2ZXMuc3BsaWNlKDApO1xuICAgIHRhYmxlcy5zdXBlcmxhdGl2ZVBsYWNlbWVudHMuc3BsaWNlKDApO1xuICAgIHRhYmxlcy5yYXRpbmdzLnNwbGljZSgwKTtcblxuICAgIHVwZGF0ZVRhYmxlcyhkYXRhKTtcbiAgICBpbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICBzZW5kQ2hhbmdlKHtcbiAgICAgICAgdHJhbnM6IGZhbHNlLFxuICAgICAgICB0eXBlOiBcImZ1bGxcIlxuICAgIH0pO1xufVxuaGFuZGxlcnMucHVzaCh7IG5hbWU6IFwidXBkYXRlLWZ1bGxcIiwgaGFuZGxlcjogb25VcGRhdGVGdWxsIH0pO1xuc2xlZGdlLl9vblVwZGF0ZUZ1bGwgPSBvblVwZGF0ZUZ1bGw7XG5cbmZ1bmN0aW9uIG9uVXBkYXRlUGFydGlhbChkYXRhKSB7XG4gICAgaWYgKCAhaW5pdGlhbGl6ZWQgKSByZXR1cm47XG4gICAgdXBkYXRlVGFibGVzKGRhdGEpO1xuXG4gICAgc2VuZENoYW5nZSh7XG4gICAgICAgIHRyYW5zOiBmYWxzZSxcbiAgICAgICAgdHlwZTogXCJwYXJ0aWFsXCJcbiAgICB9KTtcbn1cbmhhbmRsZXJzLnB1c2goeyBuYW1lOiBcInVwZGF0ZS1wYXJ0aWFsXCIsIGhhbmRsZXI6IG9uVXBkYXRlUGFydGlhbCB9KTtcbnNsZWRnZS5fb25VcGRhdGVQYXJ0aWFsID0gb25VcGRhdGVQYXJ0aWFsO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUmVxdWVzdHMgYW5kIFRyYW5zaWVudCBSZXNwb25zZXNcblxuZnVuY3Rpb24gYWRkVHJhbnNpZW50UmVzcG9uc2UoZXZlbnROYW1lKSB7XG4gICAgaGFuZGxlcnMucHVzaCh7XG4gICAgICAgIG5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgaGFuZGxlcjogZGF0YSA9PiB7XG4gICAgICAgICAgICBzZW5kQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICB0cmFuczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBldmVudE5hbWUsXG4gICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbnNsZWRnZS5fYWRkVHJhbnNpZW50UmVzcG9uc2UgPSBhZGRUcmFuc2llbnRSZXNwb25zZTtcblxuZnVuY3Rpb24gc2VuZFNjcmFwZURldnBvc3Qoe3VybH0pIHtcbiAgICBzb2NrZXQuZW1pdChcImRldnBvc3Qtc2NyYXBlXCIsIHt1cmx9KTtcbn1cbmFkZFRyYW5zaWVudFJlc3BvbnNlKFwiZGV2cG9zdC1zY3JhcGUtcmVzcG9uc2VcIik7XG5zbGVkZ2Uuc2VuZFNjcmFwZURldnBvc3QgPSBzZW5kU2NyYXBlRGV2cG9zdDtcblxuZnVuY3Rpb24gc2VuZEFkZEp1ZGdlKHtuYW1lLCBlbWFpbH0pIHtcbiAgICBzb2NrZXQuZW1pdChcImFkZC1qdWRnZVwiLCB7bmFtZSwgZW1haWx9KTtcbn1cbmFkZFRyYW5zaWVudFJlc3BvbnNlKFwiYWRkLWp1ZGdlLXJlc3BvbnNlXCIpO1xuc2xlZGdlLnNlbmRBZGRKdWRnZSA9IHNlbmRBZGRKdWRnZTtcblxuZnVuY3Rpb24gc2VuZEFsbG9jYXRlSnVkZ2VzKG9wdHMpIHtcbiAgICBpZiAoIW9wdHMubWV0aG9kKSB0aHJvdyBuZXcgRXJyb3IoXCJhbGxvY2F0ZUp1ZGdlSGFja3M6IG1ldGhvZCBtdXN0IGV4aXN0XCIpO1xuXG4gICAgc29ja2V0LmVtaXQoXCJhbGxvY2F0ZS1qdWRnZXNcIiwgb3B0cyk7XG59XG5hZGRUcmFuc2llbnRSZXNwb25zZShcImFsbG9jYXRlLWp1ZGdlcy1yZXNwb25zZVwiKTtcbnNsZWRnZS5zZW5kQWxsb2NhdGVKdWRnZXMgPSBzZW5kQWxsb2NhdGVKdWRnZXM7XG5cbmZ1bmN0aW9uIHNlbmRBZGRTdXBlcmxhdGl2ZSh7bmFtZX0pIHtcbiAgICBzb2NrZXQuZW1pdChcImFkZC1zdXBlcmxhdGl2ZVwiLCB7bmFtZX0pO1xufVxuYWRkVHJhbnNpZW50UmVzcG9uc2UoXCJhZGQtc3VwZXJsYXRpdmUtcmVzcG9uc2VcIik7XG5zbGVkZ2Uuc2VuZEFkZFN1cGVybGF0aXZlID0gc2VuZEFkZFN1cGVybGF0aXZlO1xuXG5mdW5jdGlvbiBzZW5kQWRkVG9rZW4oe2p1ZGdlSWQsIHNlY3JldH0pIHtcbiAgICBzb2NrZXQuZW1pdChcImFkZC10b2tlblwiLCB7anVkZ2VJZCwgc2VjcmV0fSk7XG59XG5hZGRUcmFuc2llbnRSZXNwb25zZShcImFkZC10b2tlbi1yZXNwb25zZVwiKTtcbnNsZWRnZS5zZW5kQWRkVG9rZW4gPSBzZW5kQWRkVG9rZW47XG5cbmZ1bmN0aW9uIHNlbmRSYXcoe2V2ZW50TmFtZSwganNvbn0pIHtcbiAgICBzb2NrZXQuZW1pdChldmVudE5hbWUsIGpzb24pO1xufVxuYWRkVHJhbnNpZW50UmVzcG9uc2UoXCJhZGQtdG9rZW4tcmVzcG9uc2VcIik7XG5zbGVkZ2Uuc2VuZFJhdyA9IHNlbmRSYXc7XG5cbmZ1bmN0aW9uIHNlbmRSYW5rU3VwZXJsYXRpdmUoZGF0YSkge1xuICAgIHNvY2tldC5lbWl0KFwicmFuay1zdXBlcmxhdGl2ZVwiLCB7XG4gICAgICAgIGp1ZGdlSWQ6IGRhdGEuanVkZ2VJZCxcbiAgICAgICAgc3VwZXJsYXRpdmVJZDogZGF0YS5zdXBlcmxhdGl2ZUlkLFxuICAgICAgICBmaXJzdENob2ljZUlkOiBkYXRhLmZpcnN0Q2hvaWNlSWQsXG4gICAgICAgIHNlY29uZENob2ljZUlkOiBkYXRhLnNlY29uZENob2ljZUlkXG4gICAgfSk7XG59XG5hZGRUcmFuc2llbnRSZXNwb25zZShcInJhbmstc3VwZXJsYXRpdmUtcmVzcG9uc2VcIik7XG5zbGVkZ2Uuc2VuZFJhbmtTdXBlcmxhdGl2ZSA9IHNlbmRSYW5rU3VwZXJsYXRpdmU7XG5cbmZ1bmN0aW9uIHNlbmRSYXRlSGFjayh7anVkZ2VJZCwgaGFja0lkLCByYXRpbmd9KSB7XG4gICAgc29ja2V0LmVtaXQoXCJyYXRlLWhhY2tcIiwge1xuICAgICAgICBqdWRnZUlkLCBoYWNrSWQsIHJhdGluZ1xuICAgIH0pO1xufVxuYWRkVHJhbnNpZW50UmVzcG9uc2UoXCJyYXRlLWhhY2stcmVzcG9uc2VcIik7XG5zbGVkZ2Uuc2VuZFJhdGVIYWNrID0gc2VuZFJhdGVIYWNrO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gSW5mb3JtYXRpb24gUXVlcnlpbmdcblxuZnVuY3Rpb24gaXNJbml0aWFsaXplZCgpIHtcbiAgICByZXR1cm4gaW5pdGlhbGl6ZWQ7XG59XG5zbGVkZ2UuaXNJbml0aWFsaXplZCA9IGlzSW5pdGlhbGl6ZWQ7XG5cbmZ1bmN0aW9uIGdldEFsbEhhY2tzKCkge1xuICAgIGlmICghaW5pdGlhbGl6ZWQpIHRocm93IG5ldyBFcnJvcihcImdldEFsbEhhY2tzOiBEYXRhIG5vdCBpbml0aWFsaXplZFwiKTtcblxuICAgIHJldHVybiB0YWJsZXMuaGFja3M7XG59XG5zbGVkZ2UuZ2V0QWxsSGFja3MgPSBnZXRBbGxIYWNrcztcblxuZnVuY3Rpb24gZ2V0QWxsSnVkZ2VzKCkge1xuICAgIGlmICghaW5pdGlhbGl6ZWQpIHRocm93IG5ldyBFcnJvcihcImdldEFsbEp1ZGdlczogRGF0YSBub3QgaW5pdGlhbGl6ZWRcIik7XG5cbiAgICByZXR1cm4gdGFibGVzLmp1ZGdlcztcbn1cbnNsZWRnZS5nZXRBbGxKdWRnZXMgPSBnZXRBbGxKdWRnZXM7XG5cbmZ1bmN0aW9uIGdldEp1ZGdlSW5mbyh7anVkZ2VJZH0pIHtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB0aHJvdyBuZXcgRXJyb3IoXCJnZXRKdWRnZUluZm86IERhdGEgbm90IGluaXRpYWxpemVkXCIpO1xuXG4gICAgcmV0dXJuIHRhYmxlcy5qdWRnZXNbanVkZ2VJZF0gfHwgbnVsbDtcbn1cbnNsZWRnZS5nZXRKdWRnZUluZm8gPSBnZXRKdWRnZUluZm87XG5cbmZ1bmN0aW9uIGdldEhhY2tzT3JkZXIoe2p1ZGdlSWR9KSB7XG4gICAgaWYgKCFpbml0aWFsaXplZCkgdGhyb3cgbmV3IEVycm9yKFwiZ2V0SGFja3NPcmRlcjogRGF0YSBub3QgaW5pdGlhbGl6ZWRcIik7XG5cbiAgICBsZXQgb3JkZXIgPSB0YWJsZXMuanVkZ2VIYWNrc1xuICAgICAgICAuZmlsdGVyKCBoID0+IGguanVkZ2VJZCA9PSBqdWRnZUlkIClcbiAgICAgICAgLnNvcnQoIChqaDEsIGpoMikgPT4gamgxLnByaW9yaXR5IC0gamgyLnByaW9yaXR5IClcbiAgICAgICAgLm1hcCggamggPT4gamguaGFja0lkICk7XG5cbiAgICBsZXQgcG9zaXRpb25zID0gW107XG4gICAgZm9yIChsZXQgaT0wO2k8b3JkZXIubGVuZ3RoO2krKykge1xuICAgICAgICBwb3NpdGlvbnNbb3JkZXJbaV1dID0gaTtcbiAgICB9XG5cbiAgICAvLyBvcmRlciBtYXBzIHBvc2l0aW9uIHRvIGhhY2tJZFxuICAgIC8vIHBvc2l0aW9ucyBtYXBzIGhhY2tJZCB0byBwb3NpdGlvblxuICAgIHJldHVybiB7IG9yZGVyLCBwb3NpdGlvbnMgfTtcbn1cbnNsZWRnZS5nZXRIYWNrc09yZGVyID0gZ2V0SGFja3NPcmRlcjtcblxuZnVuY3Rpb24gZ2V0QWxsUmF0aW5ncygpIHtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB0aHJvdyBuZXcgRXJyb3IoXCJnZXRBbGxSYXRpbmdzOiBEYXRhIG5vdCBpbml0aWFsaXplZFwiKTtcblxuICAgIGxldCByYXRpbmdzID0gW107XG4gICAgZm9yIChsZXQgaT0wO2k8dGFibGVzLmhhY2tzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgbGV0IGhhY2tSYXRpbmdzID0gW107XG4gICAgICAgIGZvciAobGV0IGo9MDtqPHRhYmxlcy5qdWRnZXMubGVuZ3RoO2orKykge1xuICAgICAgICAgICAgaGFja1JhdGluZ3Nbal0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJhdGluZ3NbaV0gPSBoYWNrUmF0aW5ncztcbiAgICB9XG5cbiAgICBmb3IgKGxldCByYXRpbmcgb2YgdGFibGVzLnJhdGluZ3MpIHtcbiAgICAgICAgaWYgKHJhdGluZykge1xuICAgICAgICAgICAgcmF0aW5nc1tyYXRpbmcuaGFja0lkXVtyYXRpbmcuanVkZ2VJZF0gPSByYXRpbmcucmF0aW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhdGluZ3M7XG59XG5zbGVkZ2UuZ2V0QWxsUmF0aW5ncyA9IGdldEFsbFJhdGluZ3M7XG5cbmZ1bmN0aW9uIGdldEp1ZGdlUmF0aW5ncyh7anVkZ2VJZH0pIHtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB0aHJvdyBuZXcgRXJyb3IoXCJnZXRKdWRnZVJhdGluZ3M6IERhdGEgbm90IGluaXRpYWxpemVkXCIpO1xuXG4gICAgbGV0IHJhdGluZ3MgPSBbXTtcblxuICAgIGZvciAobGV0IGk9MDtpPHRhYmxlcy5oYWNrcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIHJhdGluZ3NbaV0gPSAwO1xuICAgIH1cblxuICAgIGZvciAobGV0IHJhdGluZyBvZiB0YWJsZXMucmF0aW5ncykge1xuICAgICAgICBpZiAoIHJhdGluZyAmJiByYXRpbmcuanVkZ2VJZCA9PT0ganVkZ2VJZCApIHtcbiAgICAgICAgICAgIHJhdGluZ3NbcmF0aW5nLmhhY2tJZF0gPSByYXRpbmcucmF0aW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhdGluZ3M7XG59XG5zbGVkZ2UuZ2V0SnVkZ2VSYXRpbmdzID0gZ2V0SnVkZ2VSYXRpbmdzO1xuXG5mdW5jdGlvbiBnZXRTdXBlcmxhdGl2ZXMoKSB7XG4gICAgaWYgKCFpbml0aWFsaXplZCkgdGhyb3cgbmV3IEVycm9yKFwiZ2V0U3VwZXJsYXRpdmVzOiBEYXRhIG5vdCBpbml0aWFsaXplZFwiKTtcblxuICAgIGxldCBzdXBlcmxhdGl2ZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQgc3VwZXJsYXRpdmUgb2YgdGFibGVzLnN1cGVybGF0aXZlcyApIHtcbiAgICAgICAgaWYgKCBzdXBlcmxhdGl2ZSApIHtcbiAgICAgICAgICAgIHN1cGVybGF0aXZlcy5wdXNoKHN1cGVybGF0aXZlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdXBlcmxhdGl2ZXM7XG59XG5zbGVkZ2UuZ2V0U3VwZXJsYXRpdmVzID0gZ2V0U3VwZXJsYXRpdmVzO1xuXG5mdW5jdGlvbiBnZXRBbGxTdXBlcmxhdGl2ZVBsYWNlbWVudHMoKSB7XG4gICAgaWYgKCFpbml0aWFsaXplZCkgdGhyb3cgbmV3IEVycm9yKFwiZ2V0QWxsU3VwZXJsYXRpdmVzOiBEYXRhIG5vdCBpbml0aWFsaXplZFwiKTtcblxuICAgIGxldCBzdXBlcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpPTA7aTx0YWJsZXMuaGFja3MubGVuZ3RoO2krKykge1xuICAgICAgICBzdXBlcnNbaV0gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaj0wO2o8dGFibGVzLnN1cGVybGF0aXZlcy5sZW5ndGg7aisrKSB7XG4gICAgICAgICAgICBzdXBlcnNbaV1bal0gPSB7XG4gICAgICAgICAgICAgICAgZmlyc3Q6IFtdLFxuICAgICAgICAgICAgICAgIHNlY29uZDogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBzIG9mIHRhYmxlcy5zdXBlcmxhdGl2ZVBsYWNlbWVudHMpIHtcbiAgICAgICAgaWYgKHMpIHtcbiAgICAgICAgICAgIGlmIChzLmZpcnN0Q2hvaWNlID4gMCkge1xuICAgICAgICAgICAgICAgIHN1cGVyc1tzLmZpcnN0Q2hvaWNlXVtzLnN1cGVybGF0aXZlSWRdLmZpcnN0LnB1c2gocy5qdWRnZUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzLnNlY29uZENob2ljZSA+IDApIHtcbiAgICAgICAgICAgICAgICBzdXBlcnNbcy5zZWNvbmRDaG9pY2VdW3Muc3VwZXJsYXRpdmVJZF0uc2Vjb25kLnB1c2gocy5qdWRnZUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdXBlcnM7XG59XG5zbGVkZ2UuZ2V0QWxsU3VwZXJsYXRpdmVQbGFjZW1lbnRzID0gZ2V0QWxsU3VwZXJsYXRpdmVQbGFjZW1lbnRzO1xuXG5mdW5jdGlvbiBnZXRDaG9zZW5TdXBlcmxhdGl2ZXMoe2p1ZGdlSWR9KSB7XG4gICAgaWYgKCFpbml0aWFsaXplZCkgdGhyb3cgbmV3IEVycm9yKFwiZ2V0Q2hvc2VuU3VwZXJsYXRpdmVzOiBEYXRhIG5vdCBpbml0aWFsaXplZFwiKTtcblxuICAgIGxldCBjaG9zZW4gPSBbXTtcblxuICAgIC8vIEluaXRpYWxpemUgdG8gMFxuICAgIGZvciAobGV0IGk9MDtpPHRhYmxlcy5zdXBlcmxhdGl2ZXMubGVuZ3RoO2krKykge1xuICAgICAgICBjaG9zZW4ucHVzaCh7XG4gICAgICAgICAgICBmaXJzdDogMCxcbiAgICAgICAgICAgIHNlY29uZDogMFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBGaW5kIGNob3NlblxuICAgIGZvciAoIGxldCBjaG9pY2Ugb2YgdGFibGVzLnN1cGVybGF0aXZlUGxhY2VtZW50cyApIHtcbiAgICAgICAgaWYgKCBjaG9pY2UgJiYgY2hvaWNlLmp1ZGdlSWQgPT0ganVkZ2VJZCApIHtcbiAgICAgICAgICAgIGNob3NlbltjaG9pY2Uuc3VwZXJsYXRpdmVJZF0uZmlyc3QgPSBjaG9pY2UuZmlyc3RDaG9pY2U7XG4gICAgICAgICAgICBjaG9zZW5bY2hvaWNlLnN1cGVybGF0aXZlSWRdLnNlY29uZCA9IGNob2ljZS5zZWNvbmRDaG9pY2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2hvc2VuO1xufVxuc2xlZGdlLmdldENob3NlblN1cGVybGF0aXZlcyA9IGdldENob3NlblN1cGVybGF0aXZlcztcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIE90aGVyIEV4cG9ydHNcblxuZnVuY3Rpb24gc3Vic2NyaWJlKGNiKSB7XG4gICAgc3Vic2NyaWJlcnMucHVzaChjYik7XG59XG5zbGVkZ2Uuc3Vic2NyaWJlID0gc3Vic2NyaWJlO1xuXG5mdW5jdGlvbiBpbml0KG9wdHMpIHtcbiAgICBpZiAoc29ja2V0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNsZWRnZTogU29ja2V0IGFscmVhZHkgaW5pdGlhbGl6ZWQhXCIpO1xuICAgIH1cblxuICAgIHNvY2tldCA9IGlvKHtxdWVyeTogXCJzZWNyZXQ9XCIrZW5jb2RlVVJJQ29tcG9uZW50KG9wdHMudG9rZW4pfSk7XG5cbiAgICBmb3IgKGxldCBoIG9mIGhhbmRsZXJzKSB7XG4gICAgICAgIHNvY2tldC5vbihoLm5hbWUsIGguaGFuZGxlcik7XG4gICAgfVxufVxuc2xlZGdlLmluaXQgPSBpbml0O1xuXG5mdW5jdGlvbiBpbml0V2l0aFRlc3REYXRhKHRlc3RkYXRhKSB7XG4gICAgdXBkYXRlVGFibGVzKHRlc3RkYXRhKTtcbiAgICBjb25zb2xlLmxvZyh0YWJsZXMpO1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICBzZW5kQ2hhbmdlKHtcbiAgICAgICAgICAgIHRyYW5zOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6IFwiZnVsbFwiXG4gICAgICAgIH0pO1xuICAgIH0sIDIwMCk7XG59XG5zbGVkZ2UuaW5pdFdpdGhUZXN0RGF0YSA9IGluaXRXaXRoVGVzdERhdGE7XG5cbn0pKHdpbmRvdy5zbGVkZ2UgfHwgKHdpbmRvdy5zbGVkZ2UgPSB7fSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY2xpZW50L3NsZWRnZS5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIHRvZ2dsZUNsYXNzKHRvZ2dsZSwgb25DbGFzcywgb2ZmQ2xhc3MpIHtcbiAgICBpZiAoIHRvZ2dsZSAmJiBvbkNsYXNzICkge1xuICAgICAgICByZXR1cm4gXCIgXCIrb25DbGFzcztcbiAgICB9IGVsc2UgaWYgKCAhdG9nZ2xlICYmIG9mZkNsYXNzICkge1xuICAgICAgICByZXR1cm4gXCIgXCIrb2ZmQ2xhc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxud2luZG93LnRvZ2dsZUNsYXNzID0gdG9nZ2xlQ2xhc3M7XG5cbn0pKCk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uIChhZG1pblBhZ2UpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgbG9nLCBjbWQ7XG52YXIgbGFzdENtZCA9IFwiXCI7XG5cbnZhciBjb21tYW5kcyA9IFtdO1xuXG5mdW5jdGlvbiBwcmludExuKHR4dD1cIlwiKSB7XG4gICAgbGV0IHRpbWVzdHIgPSAobmV3IERhdGUoKSkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICBsZXQgbG9nc3RyID0gXCJbXCIgKyB0aW1lc3RyICArIFwiXSBcIiArIHR4dCArIFwiXFxuXCI7XG5cbiAgICBjb25zb2xlLmxvZyhsb2dzdHIpO1xuICAgIGxvZy52YWx1ZSArPSBsb2dzdHI7XG5cbiAgICBsb2cuc2Nyb2xsVG8oMCwgbG9nLnNjcm9sbEhlaWdodCk7XG59XG5hZG1pblBhZ2UucHJpbnRMbiA9IHByaW50TG47XG5cbmZ1bmN0aW9uIHByaW50V3JhcChmb3J3YXJkLCB0eHQsIHdyYXA9ODApIHtcbiAgICBsZXQgbGluZXMgPSB0eHQuc3BsaXQoXCJcXG5cIikubWFwKCBsID0+IGwuc3BsaXQoXCJcIikpO1xuICAgIHByaW50TG4oIGZvcndhcmQgKyBsaW5lc1swXS5zcGxpY2UoMCwgd3JhcC1mb3J3YXJkLmxlbmd0aCkuam9pbihcIlwiKSApO1xuICAgIGZvciAobGV0IGk9MDtpPGxpbmVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgbGV0IGxpbmUgPSBsaW5lc1tpXTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaWYgKCBpID09PSAwICYmIGxpbmUubGVuZ3RoID09PSAwICkgYnJlYWs7XG5cbiAgICAgICAgICAgIGxldCB3aGl0ZXNwYWNlID0gKG5ldyBBcnJheShmb3J3YXJkLmxlbmd0aCsxKSkuam9pbihcIiBcIik7XG4gICAgICAgICAgICBsZXQgY29udGVudCA9IGxpbmUuc3BsaWNlKDAsIE1hdGgubWF4KDEsIHdyYXAgLSBmb3J3YXJkLmxlbmd0aCkpO1xuICAgICAgICAgICAgcHJpbnRMbiggd2hpdGVzcGFjZSArIGNvbnRlbnQuam9pbihcIlwiKSApO1xuICAgICAgICB9IHdoaWxlICggbGluZS5sZW5ndGggPiAwICk7XG4gICAgfVxufVxuYWRtaW5QYWdlLnByaW50V3JhcCA9IHByaW50V3JhcDtcblxuZnVuY3Rpb24gcnVuQ29tbWFuZCh0eHQpIHtcbiAgICBsZXQgYXJncyA9IHNwbGl0Q29tbWFuZCh0eHQpO1xuICAgIGxldCBhY3Rpb24gPSBhcmdzLmxlbmd0aD09PTA/XCJcIjphcmdzWzBdLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBpZiAoIGFjdGlvbiA9PT0gXCJcIiApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxhc3RDbWQgPSB0eHQ7XG5cbiAgICBsZXQgY29tbWFuZCA9IG51bGw7XG4gICAgZm9yIChsZXQgY21kIG9mIGNvbW1hbmRzKSB7XG4gICAgICAgIGlmIChjbWQgJiYgY21kLm5hbWUgPT09IGFjdGlvbikge1xuICAgICAgICAgICAgY29tbWFuZCA9IGNtZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCAhY29tbWFuZCApIHtcbiAgICAgICAgcHJpbnRMbihcIkNvbW1hbmQgbm90IGZvdW5kOiBcIiArIGFjdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb21tYW5kLnJ1bihhcmdzKTtcbn1cbmFkbWluUGFnZS5ydW5Db21tYW5kID0gcnVuQ29tbWFuZDtcblxuZnVuY3Rpb24gc3BsaXRDb21tYW5kKHR4dCkge1xuICAgIGxldCB0b2tlbnMgPSB0eHQuc3BsaXQoXCJcIikucmV2ZXJzZSgpO1xuICAgIGxldCBhcmdzID0gW107XG5cbiAgICBpZiAoIHRva2Vucy5sZW5ndGggPT09IDAgKSByZXR1cm4gW107XG5cbiAgICBsZXQgdG9rZW4gPSB0b2tlbnMucG9wKCk7XG4gICAgbGV0IHBlZWsgPSB0b2tlbnMubGVuZ3RoPjA/dG9rZW5zLnBvcCgpOm51bGw7XG4gICAgbGV0IG5leHQgPSAoKSA9PiB7IHRva2VuPXBlZWs7cGVlaz10b2tlbnMubGVuZ3RoPjA/dG9rZW5zLnBvcCgpOm51bGw7IH07XG5cblxuICAgIHdoaWxlICggdG9rZW4gIT09IG51bGwgKSB7XG4gICAgICAgIGlmICggdG9rZW4gPT09IFwiIFwiICkge1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCB0b2tlbiA9PT0gXCJcXFwiXCIpIHtcbiAgICAgICAgICAgIGxldCBhcmcgPSBcIlwiO1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgd2hpbGUgKCB0b2tlbiAhPT0gbnVsbCAmJiB0b2tlbiAhPT0gXCJcXFwiXCIgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCB0b2tlbiA9PT0gXCJcXFxcXCIgJiYgcGVlayA9PT0gXCJcXFwiXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZyArPSBcIlxcXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHRva2VuID09PSBcIlxcXFxcIiAmJiBwZWVrID09PSBcIlxcXFxcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnICs9IFwiXFxcXFwiO1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnICs9IHRva2VuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXh0KCk7XG5cbiAgICAgICAgICAgIGlmICggYXJnICE9PSBcIlwiICkgYXJncy5wdXNoKGFyZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgYXJnID0gdG9rZW47XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB3aGlsZSAoIHRva2VuICE9PSBudWxsICYmIHRva2VuICE9PSBcIiBcIiAmJiB0b2tlbiAhPSBcIlxcXCJcIiApIHtcbiAgICAgICAgICAgICAgICBhcmcgKz0gdG9rZW47XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJncy5wdXNoKGFyZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJncztcbn1cbmFkbWluUGFnZS5zcGxpdENvbW1hbmQgPSBzcGxpdENvbW1hbmQ7XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyQ29tbWFuZChuYW1lLCBkZXNjcmlwdGlvbiwgcnVuKSB7XG4gICAgY29tbWFuZHMucHVzaCh7bmFtZSwgZGVzY3JpcHRpb24sIHJ1bn0pO1xufVxuXG5mdW5jdGlvbiBvblNsZWRnZUV2ZW50KGV2dCkge1xuICAgIGlmICggZXZ0LnRyYW5zICkge1xuICAgICAgICBwcmludExuKFwiUmVjaWV2ZWQgVHJhbnNpZW50IEV2ZW50OiBcIiArIGV2dC50eXBlKTtcbiAgICAgICAgcHJpbnRXcmFwKFwiIGRhdGE6IFwiLCBKU09OLnN0cmluZ2lmeShldnQuZGF0YSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByaW50TG4oXCJSZWNpZXZlZCBOb24tVHJhbnNpZW50IEV2ZW50OiBcIiArIGV2dC50eXBlKTtcbiAgICB9XG59XG5hZG1pblBhZ2UuX29uU2xlZGdlRXZlbnQgPSBvblNsZWRnZUV2ZW50O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxvZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpO1xuICAgIGNtZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY21kXCIpO1xuXG4gICAgbG9nLnZhbHVlID0gXCJcIjtcblxuICAgIGNtZC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBpZiAoIGV2dC5jb2RlID09PSBcIkVudGVyXCIgKSB7XG4gICAgICAgICAgICBydW5Db21tYW5kKGNtZC52YWx1ZSk7XG4gICAgICAgICAgICBjbWQudmFsdWUgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKCBldnQuY29kZSA9PSBcIkFycm93VXBcIiApIHtcbiAgICAgICAgICAgIGNtZC52YWx1ZSA9IGxhc3RDbWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICggIWxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIikgKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9rZW5cIiwgXCJ0ZXN0XCIpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImp1ZGdlSWRcIiwgXCIwXCIpO1xuICAgIH1cblxuICAgIHNsZWRnZS5pbml0KHtcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIilcbiAgICB9KTtcbiAgICBzbGVkZ2Uuc3Vic2NyaWJlKCBvblNsZWRnZUV2ZW50ICk7XG5cbiAgICBzbGVkZ2UuX3NvY2tldCgpLm9uKFwidHJhbnNpZW50LXJlc3BvbnNlXCIsIGRhdGEgPT4gY29uc29sZS5sb2coZGF0YSkpO1xuXG4gICAgcHJpbnRMbihcIkFkbWluIENvbnNvbGUgUmVhZHlcIik7XG4gICAgcHJpbnRMbihcIiBBbGwgZXZlbnRzIHdpbGwgYmUgbG9nZ2VkIGhlcmUuIFR5cGUgaGVscCBmb3IgY29tbWFuZHMuXCIpO1xuICAgIHByaW50TG4oKTtcbn1cbmFkbWluUGFnZS5pbml0ID0gaW5pdDtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIENvbW1hbmRzXG5cbnJlZ2lzdGVyQ29tbWFuZChcImhlbHBcIiwgXCJQcmludCB0aGlzIGhlbHBcIiwgZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICBwcmludExuKFwiID09PSBIZWxwID09PVwiKTtcbiAgICBwcmludExuKFwiUnVubmluZyBhIGNvbW1hbmQgd2l0aG91dCBhbnkgYXJndW1lbnRzIHByaW50cyBpdHMgdXNhZ2VcIik7XG4gICAgZm9yIChsZXQgY21kIG9mIGNvbW1hbmRzKSB7XG4gICAgICAgIHByaW50V3JhcChcIiBcIitjbWQubmFtZStcIiAtIFwiLCBjbWQuZGVzY3JpcHRpb24pO1xuICAgIH1cbiAgICBwcmludExuKCk7XG59KTtcblxucmVnaXN0ZXJDb21tYW5kKFwiZGV2cG9zdFwiLCBcIlNjcmFwZSBkZXZwb3N0XCIsIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcHJpbnRMbihcIiA9PT0gU2NyYXBlIERldnBvc3QgPT09XCIpO1xuICAgIGlmICggYXJncy5sZW5ndGggIT09IDIgKSB7XG4gICAgICAgIHByaW50TG4oXCJ1c2FnZTogZGV2cG9zdCA8dXJsPlwiKTtcbiAgICAgICAgcHJpbnRMbigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcHJpbnRMbihcIldBUk5JTkc6IFRoaXMgbWF5IHRha2UgYSB3aGlsZS4gQSBtZXNzYWdlIHdpbGwgYmUgcHJpbnRlZCB3aGVuXCIpO1xuICAgIHByaW50TG4oXCIgICAgICAgICBzY3JhcGUgaXMgc3VjY2Vzc2Z1bCBvciBmYWlscy5cIik7XG4gICAgcHJpbnRMbihcIiAgICAgICAgIEluIHRoZSBtZWFudGltZSwgdGhlIHNlcnZlciB3aWxsIGJlIHVucmVzcG9uc2l2ZS5cIik7XG5cbiAgICBzbGVkZ2Uuc2VuZFNjcmFwZURldnBvc3Qoe1xuICAgICAgICB1cmw6IGFyZ3NbMV1cbiAgICB9KTtcbn0pO1xuXG5yZWdpc3RlckNvbW1hbmQoXCJhZGRqdWRnZVwiLCBcIkFkZCBhIGp1ZGdlXCIsIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcHJpbnRMbihcIiA9PT0gQWRkIEp1ZGdlID09PVwiKTtcbiAgICBpZiAoIGFyZ3MubGVuZ3RoICE9PSAzICkge1xuICAgICAgICBwcmludExuKFwidXNhZ2U6IGFkZGp1ZGdlIDxuYW1lPiA8ZW1haWw+XCIpO1xuICAgICAgICBwcmludExuKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwcmludFdyYXAoXCJOYW1lOiAgXCIsIGFyZ3NbMV0pO1xuICAgIHByaW50V3JhcChcIkVtYWlsOiBcIiwgYXJnc1syXSk7XG4gICAgcHJpbnRMbigpO1xuXG4gICAgc2xlZGdlLnNlbmRBZGRKdWRnZSh7XG4gICAgICAgIG5hbWU6IGFyZ3NbMV0sXG4gICAgICAgIGVtYWlsOiBhcmdzWzJdXG4gICAgfSk7XG59KTtcblxucmVnaXN0ZXJDb21tYW5kKFwiYWRkc3VwZXJsYXRpdmVcIiwgXCJBZGQgYSBzdXBlcmxhdGl2ZVwiLCBmdW5jdGlvbiAoYXJncykge1xuICAgIHByaW50TG4oXCIgPT09IEFkZCBTdXBlcmxhdGl2ZSA9PT1cIik7XG4gICAgaWYgKCBhcmdzLmxlbmd0aCAhPT0gMiApIHtcbiAgICAgICAgcHJpbnRMbihcInVzYWdlOiBhZGRzdXBlcmxhdGl2ZSA8bmFtZT5cIik7XG4gICAgICAgIHByaW50TG4oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHByaW50V3JhcChcIk5hbWU6IFwiLCBhcmdzWzFdKTtcblxuICAgIHNsZWRnZS5zZW5kQWRkU3VwZXJsYXRpdmUoe1xuICAgICAgICBuYW1lOiBhcmdzWzFdXG4gICAgfSk7XG59KTtcblxucmVnaXN0ZXJDb21tYW5kKFwiYWRkdG9rZW5cIiwgXCJNYW51YWxseSBhZGQgYW4gYXV0aCB0b2tlbiAodXN1YWxseSBkb25lIGF1dG9tYXRpY2FsbHkgb24gc2lnbmluKVwiLCBmdW5jdGlvbiAoYXJncykge1xuICAgIHByaW50TG4oXCIgPT09IEFkZCBUb2tlbiA9PT1cIik7XG4gICAgaWYgKCBhcmdzLmxlbmd0aCAhPT0gMyApIHtcbiAgICAgICAgcHJpbnRMbihcInVzYWdlOiBhZGR0b2tlbiA8SnVkZ2UgSUQ+IDxzZWNyZXQ+XCIpO1xuICAgICAgICBwcmludExuKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwcmludFdyYXAoXCJKdWRnZSBJZDogXCIsIGFyZ3NbMV0pO1xuICAgIHByaW50V3JhcChcIlNlY3JldDogICBcIiwgYXJnc1syXSk7XG5cbiAgICBzbGVkZ2Uuc2VuZEFkZFRva2VuKHtcbiAgICAgICAganVkZ2VJZDogYXJnc1sxXSxcbiAgICAgICAgc2VjcmV0OiBhcmdzWzJdXG4gICAgfSk7XG59KTtcblxucmVnaXN0ZXJDb21tYW5kKFwidG9rZW5cIiwgXCJWaWV3IGFuZCBzZXQgeW91ciB0b2tlbiAobXVzdCByZWZyZXNoIHRvIHNlZSBjaGFuZ2VzKVwiLCBmdW5jdGlvbiAoYXJncykge1xuICAgIHByaW50TG4oXCIgPT09IE15IFRva2VuID09PVwiKTtcblxuICAgIGxldCBzdWJhY3Rpb24gPSBhcmdzLmxlbmd0aD4xID8gYXJnc1swXSA6IG51bGw7XG5cbiAgICBpZiAoIHN1YmFjdGlvbiA9PT0gXCJ2aWV3XCIgJiYgYXJncy5sZW5ndGggPT09IDIgKSB7XG4gICAgICAgIHByaW50V3JhcChcIllvdXIgQ3VycmVudCBUb2tlbjogICAgXCIsIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIil8fFwiW05PVCBTRVRdXCIpO1xuICAgICAgICBwcmludFdyYXAoXCJZb3VyIEN1cnJlbnQgSnVkZ2UgSWQ6IFwiLCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImp1ZGdlSWRcIil8fFwiW05PVCBTRVRdXCIpO1xuICAgICAgICBwcmludExuKCk7XG4gICAgfSBlbHNlIGlmICggc3ViYWN0b2luID09PSBcInJlbW92ZVwiICYmIGFyZ3MubGVuZ3RoID09PSAyICkge1xuICAgICAgICBwcmludFdyYXAoXCJZb3VyIFByZXZpb3VzIFRva2VuOiAgICBcIiwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0b2tlblwiKXx8XCJbTk9UIFNFVF1cIik7XG4gICAgICAgIHByaW50V3JhcChcIllvdXIgUHJldmlvdXMgSnVkZ2UgSWQ6IFwiLCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImp1ZGdlSWRcIil8fFwiW05PVCBTRVRdXCIpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICAgICAgcHJpbnRMbihcIlRoZXNlIGhhdmUgYmVlbiByZXNldC4gUmVmZXJzaGluZyB3aWxsIHJlc2V0IHRvIGRlZmF1bHQgYWRtaW4uXCIpO1xuICAgICAgICBwcmludExuKCk7XG4gICAgfSBlbHNlIGlmICggc3ViYWN0aW9uID09PSBcInNldFwiICYmIGFyZ3MubGVuZ3RoID09PSA0ICkge1xuICAgICAgICBwcmludFdyYXAoXCJZb3VyIEN1cnJlbnQgVG9rZW46ICAgIFwiLCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRva2VuXCIpfHxcIltOT1QgU0VUXVwiKTtcbiAgICAgICAgcHJpbnRXcmFwKFwiWW91ciBDdXJyZW50IEp1ZGdlIElkOiBcIiwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJqdWRnZUlkXCIpfHxcIltOT1QgU0VUXVwiKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2tlblwiLCBhcmdzWzNdKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJqdWRnZUlkXCIsIGFyZ3NbMl0pO1xuICAgICAgICBwcmludFdyYXAoXCJZb3VyIE5ldyBUb2tlbjogICAgXCIsIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIikpO1xuICAgICAgICBwcmludFdyYXAoXCJZb3VyIE5ldyBKdWRnZSBJZDogXCIsIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwianVkZ2VJZFwiKSk7XG4gICAgICAgIHByaW50TG4oXCIoSGludDogUmVmcmVzaCB0byB0YWtlIGVmZmVjdClcIik7XG4gICAgICAgIHByaW50TG4oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwcmludExuKFwidXNhZ2U6IHRva2VuIHZpZXdcIik7XG4gICAgICAgIHByaW50TG4oXCIgICAgICAgdG9rZW4gcmVtb3ZlXCIpO1xuICAgICAgICBwcmludExuKFwiICAgICAgIHRva2VuIHNldCA8bmV3IGp1ZGdlIGlkPiA8bmV3IHRva2VuPlwiKTtcbiAgICB9XG59KTtcblxucmVnaXN0ZXJDb21tYW5kKFwiYWxsb2NhdGVcIiwgXCJBbGxvY2F0ZSBqdWRnZXNcIiwgZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICBwcmludExuKFwiID09PSBBbGxvY2F0ZSBKdWRnZXMgPT09XCIpO1xuICAgIGlmICggYXJncy5sZW5ndGggPCAyICkge1xuICAgICAgICBwcmludExuKFwidXNhZ2U6IGFsbG9jYXRlIDxtZXRob2Q+IFttZXRob2Qtc3BlY2lmaWMgb3B0aW9uc11cIik7XG4gICAgICAgIHByaW50TG4oXCIgICAgICAgYWxsb2NhdGUgdGFibGVzIDxKdWRnZXMgUGVyIEhhY2s+XCIpO1xuICAgICAgICBwcmludExuKFwiICAgICAgIGFsbG9jYXRlIHByZXNlbnRhdGlvblwiKTtcbiAgICAgICAgcHJpbnRMbigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCBhcmdzWzFdID09PSBcInRhYmxlc1wiICkge1xuICAgICAgICBpZiAoIGFyZ3MubGVuZ3RoICE9PSAzICkge1xuICAgICAgICAgICAgcHJpbnRMbihcIkJhZCBhcmdzLCBzZWUgdXNhZ2VcIik7XG4gICAgICAgICAgICBwcmludExuKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzbGVkZ2Uuc2VuZEFsbG9jYXRlSnVkZ2VzKHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJ0YWJsZXNcIixcbiAgICAgICAgICAgIGp1ZGdlc1BlckhhY2s6IHBhcnNlSW50KGFyZ3NbMl0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByaW50V3JhcChcIk1ldGhvZDogXCIsIGFyZ3NbMV0pO1xuICAgICAgICBwcmludFdyYXAoXCJKdWRnZXMgUGVyIEhhY2s6IFwiLCBwYXJzZUludChhcmdzWzJdKS50b1N0cmluZygpKTtcbiAgICAgICAgcHJpbnRMbigpO1xuICAgIH0gZWxzZSBpZiAoIGFyZ3NbMV0gPT09IFwicHJlc2VudGF0aW9uXCIgKSB7XG4gICAgICAgIGlmICggYXJncy5sZW5ndGggIT09IDIgKSB7XG4gICAgICAgICAgICBwcmludExuKFwiQmFkIGFyZ3MsIHNlZSB1c2FnZVwiKTtcbiAgICAgICAgICAgIHByaW50TG4oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNsZWRnZS5zZW5kQWxsb2NhdGVKdWRnZXMoe1xuICAgICAgICAgICAgbWV0aG9kOiBcInByZXNlbnRhdGlvblwiXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByaW50V3JhcChcIk1ldGhvZDogXCIsIGFyZ3NbMV0pO1xuICAgICAgICBwcmludExuKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJpbnRMbihcIlVua25vd24gYWxsb2NhdGlvbiBtZXRob2Q6IFwiK2FyZ3NbMV0pO1xuICAgIH1cbn0pO1xuXG5yZWdpc3RlckNvbW1hbmQoXCJjbGVhclwiLCBcIkNsZWFyIHRoZSBjb21tYW5kIGxvZ1wiLCBmdW5jdGlvbiAoYXJncykge1xuICAgIGxvZy52YWx1ZSA9IFwiXCI7XG59KTtcblxufSkod2luZG93LmFkbWluUGFnZSB8fCAod2luZG93LmFkbWluUGFnZSA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvcGFnZXMvYWRtaW4uanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uIChqdWRnZVBhZ2UpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgbXlKdWRnZUlkID0gbnVsbDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBsZXQgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRva2VuXCIpO1xuICAgIGxldCBqdWRnZUlkID0gcGFyc2VJbnQobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJqdWRnZUlkXCIpKTtcblxuICAgIGlmICggIXRva2VuIHx8IGlzTmFOKGp1ZGdlSWQpICkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKS5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiQmFkIHRva2VuIG9yIEp1ZGdlIElkLiBSZWRpcmVjdGluZyB0byBsb2dpbiBwYWdlLi4uXCIpKTtcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICE9IFwiI2xvY2FsXCIpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW4uaHRtbFwiO1xuICAgICAgICAgICAgfSwgMTUwMCk7XG5cdH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCA9PSBcIiNsb2NhbFwiKSB7XG4gICAgICAgIHNsZWRnZS5pbml0V2l0aFRlc3REYXRhKGxvY2FsVGVzdERhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNsZWRnZS5pbml0KHt0b2tlbn0pO1xuICAgIH1cblxuICAgIG15SnVkZ2VJZCA9IGp1ZGdlSWQ7XG5cbiAgICB2YXIgYXBwQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIik7XG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgSnVkZ2VBcHBXcmFwcGVyLCBudWxsKSwgYXBwQ29udGFpbmVyKTtcbn1cbmp1ZGdlUGFnZS5pbml0ID0gaW5pdDtcblxuZnVuY3Rpb24gZ2V0U2xlZGdlRGF0YSgpIHtcbiAgICBpZiAoc2xlZGdlLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgICBsZXQgaGFja3MgPSBzbGVkZ2UuZ2V0QWxsSGFja3MoKTtcbiAgICAgICAgbGV0IGp1ZGdlSW5mbyA9IHNsZWRnZS5nZXRKdWRnZUluZm8oe1xuICAgICAgICAgICAganVkZ2VJZDogbXlKdWRnZUlkXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJJbmZvID0gc2xlZGdlLmdldEhhY2tzT3JkZXIoe1xuICAgICAgICAgICAganVkZ2VJZDogbXlKdWRnZUlkXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgc3VwZXJsYXRpdmVzID0gc2xlZGdlLmdldFN1cGVybGF0aXZlcygpO1xuICAgICAgICBsZXQgY2hvc2VuU3VwZXJsYXRpdmVzID0gc2xlZGdlLmdldENob3NlblN1cGVybGF0aXZlcyh7XG4gICAgICAgICAgICBqdWRnZUlkOiBteUp1ZGdlSWRcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByYXRpbmdzID0gc2xlZGdlLmdldEp1ZGdlUmF0aW5ncyh7XG4gICAgICAgICAgICBqdWRnZUlkOiBteUp1ZGdlSWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXRpYWxpemVkOiB0cnVlLFxuICAgICAgICAgICAgbXlKdWRnZUlkLFxuXG4gICAgICAgICAgICBoYWNrcyxcbiAgICAgICAgICAgIGp1ZGdlSW5mbyxcbiAgICAgICAgICAgIGhhY2tPcmRlcmluZzogb3JkZXJJbmZvLm9yZGVyLFxuICAgICAgICAgICAgaGFja1Bvc2l0aW9uczogb3JkZXJJbmZvLnBvc2l0aW9ucyxcbiAgICAgICAgICAgIHN1cGVybGF0aXZlcyxcbiAgICAgICAgICAgIGNob3NlblN1cGVybGF0aXZlcyxcbiAgICAgICAgICAgIHJhdGluZ3NcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdGlhbGl6ZWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxufVxuanVkZ2VQYWdlLmdldFNsZWRnZURhdGEgPSBnZXRTbGVkZ2VEYXRhO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVG9wbGV2ZWwgQ29tcG9uZW50XG5cbmNsYXNzIEp1ZGdlQXBwV3JhcHBlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzbGVkZ2U6IGdldFNsZWRnZURhdGEoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBzbGVkZ2Uuc3Vic2NyaWJlKHRoaXMub25VcGRhdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25VcGRhdGUoZGF0YSkge1xuICAgICAgICBpZiAoICFkYXRhLnRyYW5zICYmIHNsZWRnZS5pc0luaXRpYWxpemVkKCkgKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzbGVkZ2U6IGdldFNsZWRnZURhdGEoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNsZWRnZS5pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIGNvbXBzLkp1ZGdlQXBwLCB0aGlzLnN0YXRlLnNsZWRnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsIG51bGwsIFwiTG9hZGluZy4uLlwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmp1ZGdlUGFnZS5KdWRnZUFwcFdyYXBwZXIgPSBKdWRnZUFwcFdyYXBwZXI7XG5cbn0pKHdpbmRvdy5qdWRnZVBhZ2UgfHwgKHdpbmRvdy5qdWRnZVBhZ2UgPSB7fSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY2xpZW50L3BhZ2VzL2p1ZGdlLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbiAobG9naW5QYWdlKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGxvZ2luSW5wdXRzO1xudmFyIGVtYWlsSW5wdXQ7XG52YXIgcGFzc0lucHV0O1xudmFyIGxvZ2luQnV0dG9uO1xudmFyIGxvZ291dEJ1dHRvbjtcbnZhciBqdWRnZUJ1dHRvbjtcbnZhciB0ZXN0QnV0dG9uO1xudmFyIG1lc3NhZ2VUZXh0O1xuXG52YXIgdG9rZW4gPSBcIlwiO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxvZ2luSW5wdXRzICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9naW5JbnB1dHNcIik7XG4gICAgZW1haWxJbnB1dCAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWFpbElucHV0XCIpO1xuICAgIHBhc3NJbnB1dCAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFzc0lucHV0XCIpO1xuICAgIGxvZ2luQnV0dG9uICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9naW5CdXR0b25cIik7XG4gICAgbG9nb3V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dvdXRCdXR0b25cIik7XG4gICAganVkZ2VCdXR0b24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqdWRnZUJ1dHRvblwiKTtcbiAgICB0ZXN0QnV0dG9uICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVzdEJ1dHRvblwiKTtcbiAgICBtZXNzYWdlVGV4dCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VUZXh0XCIpO1xuXG4gICAgbG9naW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBsb2dvdXRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBqdWRnZUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHRlc3RCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIGVtYWlsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIG9uVGV4dEtleVByZXNzKTtcbiAgICBwYXNzSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIG9uVGV4dEtleVByZXNzKTtcblxuICAgIGxvZ2luQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvbkxvZ2luKTtcbiAgICBsb2dvdXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uTG9nb3V0KTtcbiAgICBqdWRnZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25KdWRnZSk7XG4gICAgdGVzdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25UZXN0KTtcblxuICAgIHRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0b2tlblwiKSB8fCBcIlwiO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgICBzZXRNZXNzYWdlKFwiQ29ubmVjdGluZyB0byBTbGVkZ2UuLi4gKE5vdGU6IGZhaWx1cmUgdG8gY29ubmVjdCBtYXkgaW5kaWNhdGUgYmFkIGNyZWRlbnRpYWxzKVwiKTtcblxuICAgICAgICBsb2dpbklucHV0cy5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICBsb2dpbkJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHRlc3RCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgICAgIHNsZWRnZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHh4KSB7XG4gICAgICAgICAgICBpZiAoc2xlZGdlLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgICAgICAgICAgIGxldCBqdWRnZUlkID0gcGFyc2VJbnQobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJqdWRnZUlkXCIpKTtcbiAgICAgICAgICAgICAgICBsZXQgaW5mbyA9IHNsZWRnZS5nZXRKdWRnZUluZm8oe2p1ZGdlSWR9KTtcblxuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldE1lc3NhZ2UoXCJZb3UgYXJlIGxvZ2dlZCBpbiBhcyBcIitpbmZvLm5hbWUrXCIgPFwiK2luZm8uZW1haWwrXCI+IChJRDogXCIraW5mby5pZCtcIikuXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNldE1lc3NhZ2UoXCJZb3UgYXJlIGxvZ2dlZCBpbiwgYnV0IHdlIGRvIG5vdCByZWNvZ25pemUgSnVkZ2UgSUQgXCIrbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJqdWRnZUlkXCIpK1wiIVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzbGVkZ2UuaW5pdCh7dG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIil9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzZXRNZXNzYWdlKFwiWW91IGFyZSBub3QgbG9nZ2VkIGluLlwiKTtcbiAgICAgICAgbG9nb3V0QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAganVkZ2VCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbn1cbmxvZ2luUGFnZS5pbml0ID0gaW5pdDtcblxuZnVuY3Rpb24gc2V0TWVzc2FnZSh0eHQpIHtcbiAgICBtZXNzYWdlVGV4dC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGxldCB0eHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodHh0KTtcbiAgICBtZXNzYWdlVGV4dC5hcHBlbmRDaGlsZCh0eHROb2RlKTtcbn1cblxuZnVuY3Rpb24gb25UZXh0S2V5UHJlc3MoZXZ0KSB7XG4gICAgaWYgKGV2dC5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBvbkxvZ2luKG51bGwpO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uTG9naW4oZXZ0KSB7XG4gICAgc2V0TWVzc2FnZShcIlZlcmlmeWluZyBsb2dpbiBpbmZvcm1hdGlvbi4uLlwiKTtcblxuICAgIGxvZ2luSW5wdXRzLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgbG9naW5CdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgaWYgKCBlbWFpbElucHV0LnZhbHVlID09PSBcImFkbWluXCIgfHwgKC9hZG1pbjpbMC05XXsxLH0vKS50ZXN0KGVtYWlsSW5wdXQudmFsdWUpICkge1xuICAgICAgICBzZXRNZXNzYWdlKFwiTG9nZ2luZyBpbiBhcyBhZG1pblwiKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJqdWRnZUlkXCIsIGVtYWlsSW5wdXQudmFsdWUgPT09IFwiYWRtaW5cIiA/IFwiMFwiIDogZW1haWxJbnB1dC52YWx1ZS5zcGxpdChcIjpcIilbMV0pO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRva2VuXCIsIHBhc3NJbnB1dC52YWx1ZSk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICB9LCA1MDApO1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHhoci5zdGF0dXMgIT0gMjAwKSB7XG4gICAgICAgICAgICBsZXQgcHJpbnRhYmxlTWVzc2FnZSA9IHhoci5yZXNwb25zZVRleHQucmVwbGFjZSgvXFw8W14+XXsxLH1cXD4vZyxcIlxcdFwiKTtcbiAgICAgICAgICAgIHNldE1lc3NhZ2UoXCJGYWlsZWQgd2l0aCBFcnJvcjogXCIgKyBwcmludGFibGVNZXNzYWdlKTtcblxuICAgICAgICAgICAgbG9naW5JbnB1dHMuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICAgIGxvZ2luQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcmVzID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIGlmICghcmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzZXRNZXNzYWdlKFwiRmFpbGVkIHdpdGggRXJyb3I6IFwiK3Jlcy5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBsb2dpbklucHV0cy5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgIGxvZ2luQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldE1lc3NhZ2UocmVzLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwianVkZ2VJZFwiLCByZXMuanVkZ2VJZCk7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2tlblwiLCByZXMudG9rZW4pO1xuXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHhoci5vcGVuKFwiUE9TVFwiLCBcIi9sb2dpblwiKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBlbWFpbDogZW1haWxJbnB1dC52YWx1ZSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3NJbnB1dC52YWx1ZVxuICAgIH0pKTtcbn1cblxuZnVuY3Rpb24gb25Mb2dvdXQoZXZ0KSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ0b2tlblwiKTtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xufVxuXG5mdW5jdGlvbiBvbkp1ZGdlKGV2dCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvanVkZ2UuaHRtbFwiO1xufVxuXG5mdW5jdGlvbiBvblRlc3QoZXZ0KSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJqdWRnZUlkXCIsIDEpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9rZW5cIiwgXCJ0ZXN0XCIpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG59XG5cbn0pKHRoaXMubG9naW5QYWdlIHx8ICh0aGlzLmxvZ2luUGFnZSA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvcGFnZXMvbG9naW4uanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uIChyZXN1bHRzUGFnZSkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB3aW5uZXJzVGFibGU7XG52YXIgc3VwZXJsYXRpdmVzVGFibGU7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgd2lubmVyc1RhYmxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aW5uZXJzVGFibGVcIik7XG4gICAgc3VwZXJsYXRpdmVzVGFibGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1cGVybGF0aXZlc1RhYmxlXCIpO1xuXG4gICAgc2xlZGdlLmluaXQoe1xuICAgICAgICB0b2tlbjogbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0b2tlblwiKVxuICAgIH0pO1xuICAgIHNsZWRnZS5zdWJzY3JpYmUob25TbGVkZ2VFdmVudCk7XG59XG5yZXN1bHRzUGFnZS5pbml0ID0gaW5pdDtcblxuZnVuY3Rpb24gb25TbGVkZ2VFdmVudChldnQpIHtcbiAgICBpZiAoc2xlZGdlLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgICByZW5kZXJXaW5uZXJzVGFibGUoKTtcbiAgICAgICAgcmVuZGVyU3VwZXJsYXRpdmVzVGFibGUoKTtcbiAgICB9XG59XG5yZXN1bHRzUGFnZS5vblNsZWRnZUV2ZW50ID0gb25TbGVkZ2VFdmVudDtcblxuZnVuY3Rpb24gcmVuZGVyV2lubmVyc1RhYmxlKCkge1xuICAgIGxldCByYXRpbmdzID0gc2xlZGdlLmdldEFsbFJhdGluZ3MoKTtcbiAgICBsZXQgaGFja3MgPSBzbGVkZ2UuZ2V0QWxsSGFja3MoKTtcbiAgICBsZXQganVkZ2VzID0gc2xlZGdlLmdldEFsbEp1ZGdlcygpO1xuICAgIGxldCBhdmVyYWdlcyA9IGNhbGNBdmVyYWdlcyhyYXRpbmdzKTtcblxuICAgIC8vc29ydCBoYWNrc1xuICAgIGxldCBsZW4gPSBhdmVyYWdlcy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsZW47IGkrKykge1xuXHRsZXQgdG1wID0gYXZlcmFnZXNbaV07IC8vQ29weSBvZiB0aGUgY3VycmVudCBlbGVtZW50LlxuXHRsZXQgdG1wUmF0aW5nID0gcmF0aW5nc1tpXTtcblx0bGV0IHRtcEhhY2sgPSBoYWNrc1tpXTtcblx0Ly9DaGVjayB0aHJvdWdoIHRoZSBzb3J0ZWQgcGFydCBhbmQgY29tcGFyZSB3aXRoIHRoZSBudW1iZXIgaW4gdG1wLlxuXHQvL21heWJlIGkgc2hvdWxkIHdvcmsgb3V0IGEgd2F5IHRvIG5vdCB1c2UgdmFyIGhlcmUsIGJ1dCB3aGF0ZXZlclxuXHRmb3IgKHZhciBqID0gaSAtIDE7IGogPiAwICYmIChhdmVyYWdlc1tqXSA8PSB0bXApOyBqLS0pIHtcblx0ICAgIC8vU2hpZnQgdGhlIG51bWJlclxuXHQgICAgYXZlcmFnZXNbaiArIDFdID0gYXZlcmFnZXNbal07XG5cdCAgICByYXRpbmdzW2ogKyAxXSA9IHJhdGluZ3Nbal07XG5cdCAgICBoYWNrc1tqICsgMV0gPSBoYWNrc1tqXTtcblx0ICAgIFxuXHR9XG5cdC8vSW5zZXJ0IHRoZSBjb3BpZWQgbnVtYmVyIGF0IHRoZSBjb3JyZWN0IHBvc2l0aW9uXG5cdC8vaW4gc29ydGVkIHBhcnQuXG5cdGF2ZXJhZ2VzW2ogKyAxXSA9IHRtcDtcblx0cmF0aW5nc1tqICsgMV0gPSB0bXBSYXRpbmc7XG5cdGhhY2tzW2ogKyAxXSA9IHRtcEhhY2s7XG4gICAgfVxuXG4gICAgbGV0IGNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudC5iaW5kKGRvY3VtZW50KTtcbiAgICBsZXQgY3QgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZS5iaW5kKGRvY3VtZW50KTtcblxuICAgIGxldCB0aGVhZCA9IGNlKFwidGhlYWRcIik7XG4gICAgbGV0IHRoZWFkX3RyID0gY2UoXCJ0clwiKTtcbiAgICBsZXQgdGhlYWRfdHJfaGFja3MgPSBjZShcInRoXCIpO1xuICAgIHRoZWFkX3RyX2hhY2tzLmFwcGVuZENoaWxkKGN0KFwiSGFjayBOYW1lXCIpKTtcbiAgICB0aGVhZF90ci5hcHBlbmRDaGlsZCh0aGVhZF90cl9oYWNrcyk7XG4gICAgZm9yIChsZXQgaT0xO2k8anVkZ2VzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgbGV0IHRkID0gY2UoXCJ0aFwiKTtcbiAgICAgICAgdGQuYXBwZW5kQ2hpbGQoY3QoIGp1ZGdlc1tpXS5uYW1lICkpO1xuICAgICAgICB0aGVhZF90ci5hcHBlbmRDaGlsZCh0ZCk7XG4gICAgfVxuICAgIGxldCB0aGVhZF90cl9hdmcgPSBjZShcInRoXCIpO1xuICAgIHRoZWFkX3RyX2F2Zy5hcHBlbmRDaGlsZChjdChcIkF2ZXJhZ2VcIikpO1xuICAgIHRoZWFkX3RyLmFwcGVuZENoaWxkKHRoZWFkX3RyX2F2Zyk7XG4gICAgdGhlYWQuYXBwZW5kQ2hpbGQodGhlYWRfdHIpO1xuXG4gICAgbGV0IHRib2R5ID0gY2UoXCJ0Ym9keVwiKTtcbiAgICBmb3IgKGxldCBpPTE7aTxoYWNrcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIGxldCB0ciA9IGNlKFwidHJcIik7XG4gICAgICAgIGxldCB0cl9uYW1lID0gY2UoXCJ0ZFwiKTtcbiAgICAgICAgdHJfbmFtZS5hcHBlbmRDaGlsZChjdChoYWNrc1tpXS5uYW1lKSk7XG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRyX25hbWUpO1xuXG4gICAgICAgIGZvciAobGV0IGo9MTtqPGp1ZGdlcy5sZW5ndGg7aisrKSB7XG4gICAgICAgICAgICBsZXQgdGQgPSBjZShcInRkXCIpO1xuICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQoY3QoIHJhdGluZ1N0cmluZyhyYXRpbmdzW2ldW2pdKSApKTtcbiAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0cl9hdmcgPSBjZShcInRkXCIpO1xuICAgICAgICB0cl9hdmcuYXBwZW5kQ2hpbGQoY3QoYXZlcmFnZXNbaV0+MD9hdmVyYWdlc1tpXS50b1N0cmluZygxMCk6XCJOL0FcIikpO1xuICAgICAgICB0ci5hcHBlbmRDaGlsZCh0cl9hdmcpO1xuXG4gICAgICAgIHRib2R5LmFwcGVuZENoaWxkKHRyKTtcbiAgICB9XG5cbiAgICB3aW5uZXJzVGFibGUuaW5uZXJIVE1MID0gXCJcIjtcbiAgICB3aW5uZXJzVGFibGUuYXBwZW5kQ2hpbGQodGhlYWQpO1xuICAgIHdpbm5lcnNUYWJsZS5hcHBlbmRDaGlsZCh0Ym9keSk7XG59XG5yZXN1bHRzUGFnZS5yZW5kZXJXaW5uZXJzVGFibGUgPSByZW5kZXJXaW5uZXJzVGFibGU7XG5cbmZ1bmN0aW9uIHJhdGluZ1N0cmluZyhyYXRpbmcpIHtcbiAgICBpZiAoIHJhdGluZyA8IDAgKSB7XG4gICAgICAgIHJldHVybiBcIk5vIFNob3dcIjtcbiAgICB9IGVsc2UgaWYgKCByYXRpbmcgPT0gMCApIHtcbiAgICAgICAgcmV0dXJuIFwiLVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByYXRpbmcudG9TdHJpbmcoMTApO1xuICAgIH1cbn1cbnJlc3VsdHNQYWdlLnJhdGluZ1N0cmluZyA9IHJhdGluZ1N0cmluZztcblxuZnVuY3Rpb24gY2FsY0F2ZXJhZ2VzKHJhdGluZ3MpIHtcbiAgICByZXR1cm4gcmF0aW5ncy5tYXAoZnVuY3Rpb24gKHJzKSB7XG4gICAgICAgIGxldCByYXRlcnMgPSAwO1xuICAgICAgICBsZXQgdG90YWwgPSAwO1xuICAgICAgICBmb3IgKGxldCBpPTA7aTxycy5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICBpZiAoIHJzW2ldID4gMCApIHtcbiAgICAgICAgICAgICAgICB0b3RhbCArPSByc1tpXTtcbiAgICAgICAgICAgICAgICByYXRlcnMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcmF0ZXJzIDw9IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdG90YWwgLyByYXRlcnM7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbnJlc3VsdHNQYWdlLmNhbGNBdmVyYWdlcyA9IGNhbGNBdmVyYWdlcztcblxuZnVuY3Rpb24gcmVuZGVyU3VwZXJsYXRpdmVzVGFibGUoKSB7XG4gICAgbGV0IHNjb3JlcyA9IGNhbGNTdXBlclNjb3JlcygpO1xuXG4gICAgbGV0IGNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudC5iaW5kKGRvY3VtZW50KTtcbiAgICBsZXQgY3QgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZS5iaW5kKGRvY3VtZW50KTtcblxuICAgIGZ1bmN0aW9uIHRoKG5hbWUpIHtcbiAgICAgICAgbGV0IHRoID0gY2UoXCJ0aFwiKTtcbiAgICAgICAgdGguYXBwZW5kQ2hpbGQoY3QobmFtZSkpO1xuICAgICAgICByZXR1cm4gdGg7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRkKG5hbWUpIHtcbiAgICAgICAgbGV0IHRkID0gY2UoXCJ0ZFwiKTtcbiAgICAgICAgdGQuYXBwZW5kQ2hpbGQoY3QobmFtZSkpO1xuICAgICAgICByZXR1cm4gdGQ7XG4gICAgfVxuXG4gICAgbGV0IGhhY2tzID0gc2xlZGdlLmdldEFsbEhhY2tzKCk7XG4gICAgbGV0IHNzID0gc2xlZGdlLmdldFN1cGVybGF0aXZlcygpO1xuXG4gICAgbGV0IHRoZWFkID0gY2UoXCJ0aGVhZFwiKTtcbiAgICBsZXQgdGhlYWRfdHIgPSBjZShcInRyXCIpO1xuICAgIHRoZWFkX3RyLmFwcGVuZENoaWxkKHRoKFwiSGFjayBOYW1lXCIpKTtcbiAgICBmb3IgKGxldCBpPTA7aTxzcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIHRoZWFkX3RyLmFwcGVuZENoaWxkKHRoKHNzW2ldLm5hbWUpKTtcbiAgICB9XG4gICAgdGhlYWQuYXBwZW5kQ2hpbGQodGhlYWRfdHIpO1xuXG4gICAgbGV0IHRib2R5ID0gY2UoXCJ0Ym9keVwiKTtcbiAgICBmb3IgKGxldCBpPTE7aTxoYWNrcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIGxldCB0ciA9IGNlKFwidHJcIik7XG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKGhhY2tzW2ldLm5hbWUpKTtcbiAgICAgICAgZm9yIChsZXQgaj0wO2o8c3MubGVuZ3RoO2orKykge1xuICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGQoc2NvcmVzW2ldW2pdKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGJvZHkuYXBwZW5kQ2hpbGQodHIpO1xuICAgIH1cblxuICAgIHN1cGVybGF0aXZlc1RhYmxlLmlubmVySFRNTCA9IFwiXCI7XG4gICAgc3VwZXJsYXRpdmVzVGFibGUuYXBwZW5kQ2hpbGQodGhlYWQpO1xuICAgIHN1cGVybGF0aXZlc1RhYmxlLmFwcGVuZENoaWxkKHRib2R5KTtcbn1cbnJlc3VsdHNQYWdlLnJlbmRlclN1cGVybGF0aXZlc1RhYmxlID0gcmVuZGVyU3VwZXJsYXRpdmVzVGFibGU7XG5cbmZ1bmN0aW9uIGNhbGNTdXBlclNjb3JlcygpIHtcbiAgICBsZXQgcGxhY2VtZW50cyA9IHNsZWRnZS5nZXRBbGxTdXBlcmxhdGl2ZVBsYWNlbWVudHMoKTtcbiAgICByZXR1cm4gcGxhY2VtZW50cy5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcmV0dXJuIHMubWFwKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJGaXJzdDpcIitvLmZpcnN0Lmxlbmd0aCtcIiAvIFNlY29uZDpcIitvLnNlY29uZC5sZW5ndGgrXCIgPSBcIlxuICAgICAgICAgICAgICAgICsgKG8uZmlyc3QubGVuZ3RoKjIrby5zZWNvbmQubGVuZ3RoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5yZXN1bHRzUGFnZS5jYWxjU3VwZXJTY29yZXMgPSBjYWxjU3VwZXJTY29yZXM7XG5cbn0pKHdpbmRvdy5yZXN1bHRzUGFnZSB8fCAod2luZG93LnJlc3VsdHNQYWdlID0ge30pKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NsaWVudC9wYWdlcy9yZXN1bHRzLmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbiAoc2xlZGdlKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIHNvY2tldCA9IG51bGw7XG52YXIgc3Vic2NyaWJlcnMgPSBbXTtcbnZhciBoYW5kbGVycyA9IFtdO1xudmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG5cbnNsZWRnZS5fc29ja2V0ID0gKCkgPT4gc29ja2V0O1xuc2xlZGdlLl9zdWJzY3JpYmVycyA9IHN1YnNjcmliZXJzO1xuc2xlZGdlLl9oYW5kbGVycyA9IGhhbmRsZXJzO1xuc2xlZGdlLl9pbml0aWFsaXplZCA9ICgpID0+IGluaXRpYWxpemVkO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gR2xvYmFsIFRhYmxlc1xuXG52YXIgdGFibGVzID0ge1xuICAgIGhhY2tzOiBbXSwgLy8ge2lkLCBuYW1lLCBkZXNjcmlwdGlvbiwgbG9jYXRpb259XG4gICAganVkZ2VzOiBbXSwgLy8ge2lkLCBuYW1lLCBlbWFpbH1cbiAgICBqdWRnZUhhY2tzOiBbXSwgLy8ge2lkLCBqdWRnZUlkLCBoYWNrSWQsIHByaW9yaXR5fVxuICAgIHN1cGVybGF0aXZlczogW10sIC8vIHtpZCwgbmFtZX1cbiAgICBzdXBlcmxhdGl2ZVBsYWNlbWVudHM6IFtdLCAvLyB7aWQsIGp1ZGdlSWQsIHN1cGVybGF0aXZlSWQsIGZpcnN0Q2hvaWNlLCBzZWNvbmRDaG9pY2V9XG4gICAgcmF0aW5nczogW10sIC8vIHtpZCwganVkZ2VJZCwgaGFja0lkLCByYXRpbmd9XG59O1xuc2xlZGdlLl90YWJsZXMgPSB0YWJsZXM7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQcml2YXRlIEhlbHBlcnNcblxuZnVuY3Rpb24gdXBkYXRlVGFibGVzKGRhdGEpIHtcbiAgICBmb3IgKCBsZXQgdGFibGUgb2YgT2JqZWN0LmtleXModGFibGVzKSApIHtcbiAgICAgICAgaWYgKCBkYXRhW3RhYmxlXSApIHtcbiAgICAgICAgICAgIGZvciAoIGxldCByb3cgb2YgZGF0YVt0YWJsZV0gKSB7XG4gICAgICAgICAgICAgICAgaWYgKCByb3cgJiYgcm93LmlkICkge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZXNbdGFibGVdW3Jvdy5pZF0gPSByb3c7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuc2xlZGdlLl91cGRhdGVUYWJsZXMgPSB1cGRhdGVUYWJsZXM7XG5cbmZ1bmN0aW9uIHNlbmRDaGFuZ2UoY29udGVudCkge1xuICAgIGZvciAobGV0IHN1YiBvZiBzdWJzY3JpYmVycylcbiAgICAgICAgaWYgKHN1Yikgc3ViKGNvbnRlbnQpO1xufVxuc2xlZGdlLl9zZW5kQ2hhbmdlID0gc2VuZENoYW5nZTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFVwZGF0ZSBIYW5kbGVyc1xuXG5mdW5jdGlvbiBvbkVycm9yKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yXCIsIGRhdGEpO1xufVxuaGFuZGxlcnMucHVzaCh7IG5hbWU6IFwiZXJyb3JcIiwgaGFuZGxlcjogb25FcnJvciB9KTtcbnNsZWRnZS5fb25FcnJvciA9IG9uRXJyb3I7XG5cbmZ1bmN0aW9uIG9uVXBkYXRlRnVsbChkYXRhKSB7XG4gICAgdGFibGVzLmhhY2tzLnNwbGljZSgwKTtcbiAgICB0YWJsZXMuanVkZ2VzLnNwbGljZSgwKTtcbiAgICB0YWJsZXMuanVkZ2VIYWNrcy5zcGxpY2UoMCk7XG4gICAgdGFibGVzLnN1cGVybGF0aXZlcy5zcGxpY2UoMCk7XG4gICAgdGFibGVzLnN1cGVybGF0aXZlUGxhY2VtZW50cy5zcGxpY2UoMCk7XG4gICAgdGFibGVzLnJhdGluZ3Muc3BsaWNlKDApO1xuXG4gICAgdXBkYXRlVGFibGVzKGRhdGEpO1xuICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIHNlbmRDaGFuZ2Uoe1xuICAgICAgICB0cmFuczogZmFsc2UsXG4gICAgICAgIHR5cGU6IFwiZnVsbFwiXG4gICAgfSk7XG59XG5oYW5kbGVycy5wdXNoKHsgbmFtZTogXCJ1cGRhdGUtZnVsbFwiLCBoYW5kbGVyOiBvblVwZGF0ZUZ1bGwgfSk7XG5zbGVkZ2UuX29uVXBkYXRlRnVsbCA9IG9uVXBkYXRlRnVsbDtcblxuZnVuY3Rpb24gb25VcGRhdGVQYXJ0aWFsKGRhdGEpIHtcbiAgICBpZiAoICFpbml0aWFsaXplZCApIHJldHVybjtcbiAgICB1cGRhdGVUYWJsZXMoZGF0YSk7XG5cbiAgICBzZW5kQ2hhbmdlKHtcbiAgICAgICAgdHJhbnM6IGZhbHNlLFxuICAgICAgICB0eXBlOiBcInBhcnRpYWxcIlxuICAgIH0pO1xufVxuaGFuZGxlcnMucHVzaCh7IG5hbWU6IFwidXBkYXRlLXBhcnRpYWxcIiwgaGFuZGxlcjogb25VcGRhdGVQYXJ0aWFsIH0pO1xuc2xlZGdlLl9vblVwZGF0ZVBhcnRpYWwgPSBvblVwZGF0ZVBhcnRpYWw7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBSZXF1ZXN0cyBhbmQgVHJhbnNpZW50IFJlc3BvbnNlc1xuXG5mdW5jdGlvbiBhZGRUcmFuc2llbnRSZXNwb25zZShldmVudE5hbWUpIHtcbiAgICBoYW5kbGVycy5wdXNoKHtcbiAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICBoYW5kbGVyOiBkYXRhID0+IHtcbiAgICAgICAgICAgIHNlbmRDaGFuZ2Uoe1xuICAgICAgICAgICAgICAgIHRyYW5zOiB0cnVlLFxuICAgICAgICAgICAgICAgIHR5cGU6IGV2ZW50TmFtZSxcbiAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuc2xlZGdlLl9hZGRUcmFuc2llbnRSZXNwb25zZSA9IGFkZFRyYW5zaWVudFJlc3BvbnNlO1xuXG5mdW5jdGlvbiBzZW5kU2NyYXBlRGV2cG9zdCh7dXJsfSkge1xuICAgIHNvY2tldC5lbWl0KFwiZGV2cG9zdC1zY3JhcGVcIiwge3VybH0pO1xufVxuYWRkVHJhbnNpZW50UmVzcG9uc2UoXCJkZXZwb3N0LXNjcmFwZS1yZXNwb25zZVwiKTtcbnNsZWRnZS5zZW5kU2NyYXBlRGV2cG9zdCA9IHNlbmRTY3JhcGVEZXZwb3N0O1xuXG5mdW5jdGlvbiBzZW5kQWRkSnVkZ2Uoe25hbWUsIGVtYWlsfSkge1xuICAgIHNvY2tldC5lbWl0KFwiYWRkLWp1ZGdlXCIsIHtuYW1lLCBlbWFpbH0pO1xufVxuYWRkVHJhbnNpZW50UmVzcG9uc2UoXCJhZGQtanVkZ2UtcmVzcG9uc2VcIik7XG5zbGVkZ2Uuc2VuZEFkZEp1ZGdlID0gc2VuZEFkZEp1ZGdlO1xuXG5mdW5jdGlvbiBzZW5kQWxsb2NhdGVKdWRnZXMob3B0cykge1xuICAgIGlmICghb3B0cy5tZXRob2QpIHRocm93IG5ldyBFcnJvcihcImFsbG9jYXRlSnVkZ2VIYWNrczogbWV0aG9kIG11c3QgZXhpc3RcIik7XG5cbiAgICBzb2NrZXQuZW1pdChcImFsbG9jYXRlLWp1ZGdlc1wiLCBvcHRzKTtcbn1cbmFkZFRyYW5zaWVudFJlc3BvbnNlKFwiYWxsb2NhdGUtanVkZ2VzLXJlc3BvbnNlXCIpO1xuc2xlZGdlLnNlbmRBbGxvY2F0ZUp1ZGdlcyA9IHNlbmRBbGxvY2F0ZUp1ZGdlcztcblxuZnVuY3Rpb24gc2VuZEFkZFN1cGVybGF0aXZlKHtuYW1lfSkge1xuICAgIHNvY2tldC5lbWl0KFwiYWRkLXN1cGVybGF0aXZlXCIsIHtuYW1lfSk7XG59XG5hZGRUcmFuc2llbnRSZXNwb25zZShcImFkZC1zdXBlcmxhdGl2ZS1yZXNwb25zZVwiKTtcbnNsZWRnZS5zZW5kQWRkU3VwZXJsYXRpdmUgPSBzZW5kQWRkU3VwZXJsYXRpdmU7XG5cbmZ1bmN0aW9uIHNlbmRBZGRUb2tlbih7anVkZ2VJZCwgc2VjcmV0fSkge1xuICAgIHNvY2tldC5lbWl0KFwiYWRkLXRva2VuXCIsIHtqdWRnZUlkLCBzZWNyZXR9KTtcbn1cbmFkZFRyYW5zaWVudFJlc3BvbnNlKFwiYWRkLXRva2VuLXJlc3BvbnNlXCIpO1xuc2xlZGdlLnNlbmRBZGRUb2tlbiA9IHNlbmRBZGRUb2tlbjtcblxuZnVuY3Rpb24gc2VuZFJhdyh7ZXZlbnROYW1lLCBqc29ufSkge1xuICAgIHNvY2tldC5lbWl0KGV2ZW50TmFtZSwganNvbik7XG59XG5hZGRUcmFuc2llbnRSZXNwb25zZShcImFkZC10b2tlbi1yZXNwb25zZVwiKTtcbnNsZWRnZS5zZW5kUmF3ID0gc2VuZFJhdztcblxuZnVuY3Rpb24gc2VuZFJhbmtTdXBlcmxhdGl2ZShkYXRhKSB7XG4gICAgc29ja2V0LmVtaXQoXCJyYW5rLXN1cGVybGF0aXZlXCIsIHtcbiAgICAgICAganVkZ2VJZDogZGF0YS5qdWRnZUlkLFxuICAgICAgICBzdXBlcmxhdGl2ZUlkOiBkYXRhLnN1cGVybGF0aXZlSWQsXG4gICAgICAgIGZpcnN0Q2hvaWNlSWQ6IGRhdGEuZmlyc3RDaG9pY2VJZCxcbiAgICAgICAgc2Vjb25kQ2hvaWNlSWQ6IGRhdGEuc2Vjb25kQ2hvaWNlSWRcbiAgICB9KTtcbn1cbmFkZFRyYW5zaWVudFJlc3BvbnNlKFwicmFuay1zdXBlcmxhdGl2ZS1yZXNwb25zZVwiKTtcbnNsZWRnZS5zZW5kUmFua1N1cGVybGF0aXZlID0gc2VuZFJhbmtTdXBlcmxhdGl2ZTtcblxuZnVuY3Rpb24gc2VuZFJhdGVIYWNrKHtqdWRnZUlkLCBoYWNrSWQsIHJhdGluZ30pIHtcbiAgICBzb2NrZXQuZW1pdChcInJhdGUtaGFja1wiLCB7XG4gICAgICAgIGp1ZGdlSWQsIGhhY2tJZCwgcmF0aW5nXG4gICAgfSk7XG59XG5hZGRUcmFuc2llbnRSZXNwb25zZShcInJhdGUtaGFjay1yZXNwb25zZVwiKTtcbnNsZWRnZS5zZW5kUmF0ZUhhY2sgPSBzZW5kUmF0ZUhhY2s7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBJbmZvcm1hdGlvbiBRdWVyeWluZ1xuXG5mdW5jdGlvbiBpc0luaXRpYWxpemVkKCkge1xuICAgIHJldHVybiBpbml0aWFsaXplZDtcbn1cbnNsZWRnZS5pc0luaXRpYWxpemVkID0gaXNJbml0aWFsaXplZDtcblxuZnVuY3Rpb24gZ2V0QWxsSGFja3MoKSB7XG4gICAgaWYgKCFpbml0aWFsaXplZCkgdGhyb3cgbmV3IEVycm9yKFwiZ2V0QWxsSGFja3M6IERhdGEgbm90IGluaXRpYWxpemVkXCIpO1xuXG4gICAgcmV0dXJuIHRhYmxlcy5oYWNrcztcbn1cbnNsZWRnZS5nZXRBbGxIYWNrcyA9IGdldEFsbEhhY2tzO1xuXG5mdW5jdGlvbiBnZXRBbGxKdWRnZXMoKSB7XG4gICAgaWYgKCFpbml0aWFsaXplZCkgdGhyb3cgbmV3IEVycm9yKFwiZ2V0QWxsSnVkZ2VzOiBEYXRhIG5vdCBpbml0aWFsaXplZFwiKTtcblxuICAgIHJldHVybiB0YWJsZXMuanVkZ2VzO1xufVxuc2xlZGdlLmdldEFsbEp1ZGdlcyA9IGdldEFsbEp1ZGdlcztcblxuZnVuY3Rpb24gZ2V0SnVkZ2VJbmZvKHtqdWRnZUlkfSkge1xuICAgIGlmICghaW5pdGlhbGl6ZWQpIHRocm93IG5ldyBFcnJvcihcImdldEp1ZGdlSW5mbzogRGF0YSBub3QgaW5pdGlhbGl6ZWRcIik7XG5cbiAgICByZXR1cm4gdGFibGVzLmp1ZGdlc1tqdWRnZUlkXSB8fCBudWxsO1xufVxuc2xlZGdlLmdldEp1ZGdlSW5mbyA9IGdldEp1ZGdlSW5mbztcblxuZnVuY3Rpb24gZ2V0SGFja3NPcmRlcih7anVkZ2VJZH0pIHtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB0aHJvdyBuZXcgRXJyb3IoXCJnZXRIYWNrc09yZGVyOiBEYXRhIG5vdCBpbml0aWFsaXplZFwiKTtcblxuICAgIGxldCBvcmRlciA9IHRhYmxlcy5qdWRnZUhhY2tzXG4gICAgICAgIC5maWx0ZXIoIGggPT4gaC5qdWRnZUlkID09IGp1ZGdlSWQgKVxuICAgICAgICAuc29ydCggKGpoMSwgamgyKSA9PiBqaDEucHJpb3JpdHkgLSBqaDIucHJpb3JpdHkgKVxuICAgICAgICAubWFwKCBqaCA9PiBqaC5oYWNrSWQgKTtcblxuICAgIGxldCBwb3NpdGlvbnMgPSBbXTtcbiAgICBmb3IgKGxldCBpPTA7aTxvcmRlci5sZW5ndGg7aSsrKSB7XG4gICAgICAgIHBvc2l0aW9uc1tvcmRlcltpXV0gPSBpO1xuICAgIH1cblxuICAgIC8vIG9yZGVyIG1hcHMgcG9zaXRpb24gdG8gaGFja0lkXG4gICAgLy8gcG9zaXRpb25zIG1hcHMgaGFja0lkIHRvIHBvc2l0aW9uXG4gICAgcmV0dXJuIHsgb3JkZXIsIHBvc2l0aW9ucyB9O1xufVxuc2xlZGdlLmdldEhhY2tzT3JkZXIgPSBnZXRIYWNrc09yZGVyO1xuXG5mdW5jdGlvbiBnZXRBbGxSYXRpbmdzKCkge1xuICAgIGlmICghaW5pdGlhbGl6ZWQpIHRocm93IG5ldyBFcnJvcihcImdldEFsbFJhdGluZ3M6IERhdGEgbm90IGluaXRpYWxpemVkXCIpO1xuXG4gICAgbGV0IHJhdGluZ3MgPSBbXTtcbiAgICBmb3IgKGxldCBpPTA7aTx0YWJsZXMuaGFja3MubGVuZ3RoO2krKykge1xuICAgICAgICBsZXQgaGFja1JhdGluZ3MgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaj0wO2o8dGFibGVzLmp1ZGdlcy5sZW5ndGg7aisrKSB7XG4gICAgICAgICAgICBoYWNrUmF0aW5nc1tqXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmF0aW5nc1tpXSA9IGhhY2tSYXRpbmdzO1xuICAgIH1cblxuICAgIGZvciAobGV0IHJhdGluZyBvZiB0YWJsZXMucmF0aW5ncykge1xuICAgICAgICBpZiAocmF0aW5nKSB7XG4gICAgICAgICAgICByYXRpbmdzW3JhdGluZy5oYWNrSWRdW3JhdGluZy5qdWRnZUlkXSA9IHJhdGluZy5yYXRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmF0aW5ncztcbn1cbnNsZWRnZS5nZXRBbGxSYXRpbmdzID0gZ2V0QWxsUmF0aW5ncztcblxuZnVuY3Rpb24gZ2V0SnVkZ2VSYXRpbmdzKHtqdWRnZUlkfSkge1xuICAgIGlmICghaW5pdGlhbGl6ZWQpIHRocm93IG5ldyBFcnJvcihcImdldEp1ZGdlUmF0aW5nczogRGF0YSBub3QgaW5pdGlhbGl6ZWRcIik7XG5cbiAgICBsZXQgcmF0aW5ncyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaT0wO2k8dGFibGVzLmhhY2tzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgcmF0aW5nc1tpXSA9IDA7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgcmF0aW5nIG9mIHRhYmxlcy5yYXRpbmdzKSB7XG4gICAgICAgIGlmICggcmF0aW5nICYmIHJhdGluZy5qdWRnZUlkID09PSBqdWRnZUlkICkge1xuICAgICAgICAgICAgcmF0aW5nc1tyYXRpbmcuaGFja0lkXSA9IHJhdGluZy5yYXRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmF0aW5ncztcbn1cbnNsZWRnZS5nZXRKdWRnZVJhdGluZ3MgPSBnZXRKdWRnZVJhdGluZ3M7XG5cbmZ1bmN0aW9uIGdldFN1cGVybGF0aXZlcygpIHtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB0aHJvdyBuZXcgRXJyb3IoXCJnZXRTdXBlcmxhdGl2ZXM6IERhdGEgbm90IGluaXRpYWxpemVkXCIpO1xuXG4gICAgbGV0IHN1cGVybGF0aXZlcyA9IFtdO1xuICAgIGZvciAoIGxldCBzdXBlcmxhdGl2ZSBvZiB0YWJsZXMuc3VwZXJsYXRpdmVzICkge1xuICAgICAgICBpZiAoIHN1cGVybGF0aXZlICkge1xuICAgICAgICAgICAgc3VwZXJsYXRpdmVzLnB1c2goc3VwZXJsYXRpdmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVybGF0aXZlcztcbn1cbnNsZWRnZS5nZXRTdXBlcmxhdGl2ZXMgPSBnZXRTdXBlcmxhdGl2ZXM7XG5cbmZ1bmN0aW9uIGdldEFsbFN1cGVybGF0aXZlUGxhY2VtZW50cygpIHtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB0aHJvdyBuZXcgRXJyb3IoXCJnZXRBbGxTdXBlcmxhdGl2ZXM6IERhdGEgbm90IGluaXRpYWxpemVkXCIpO1xuXG4gICAgbGV0IHN1cGVycyA9IFtdO1xuICAgIGZvciAobGV0IGk9MDtpPHRhYmxlcy5oYWNrcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIHN1cGVyc1tpXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBqPTA7ajx0YWJsZXMuc3VwZXJsYXRpdmVzLmxlbmd0aDtqKyspIHtcbiAgICAgICAgICAgIHN1cGVyc1tpXVtqXSA9IHtcbiAgICAgICAgICAgICAgICBmaXJzdDogW10sXG4gICAgICAgICAgICAgICAgc2Vjb25kOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IHMgb2YgdGFibGVzLnN1cGVybGF0aXZlUGxhY2VtZW50cykge1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgaWYgKHMuZmlyc3RDaG9pY2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgc3VwZXJzW3MuZmlyc3RDaG9pY2VdW3Muc3VwZXJsYXRpdmVJZF0uZmlyc3QucHVzaChzLmp1ZGdlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHMuc2Vjb25kQ2hvaWNlID4gMCkge1xuICAgICAgICAgICAgICAgIHN1cGVyc1tzLnNlY29uZENob2ljZV1bcy5zdXBlcmxhdGl2ZUlkXS5zZWNvbmQucHVzaChzLmp1ZGdlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVycztcbn1cbnNsZWRnZS5nZXRBbGxTdXBlcmxhdGl2ZVBsYWNlbWVudHMgPSBnZXRBbGxTdXBlcmxhdGl2ZVBsYWNlbWVudHM7XG5cbmZ1bmN0aW9uIGdldENob3NlblN1cGVybGF0aXZlcyh7anVkZ2VJZH0pIHtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB0aHJvdyBuZXcgRXJyb3IoXCJnZXRDaG9zZW5TdXBlcmxhdGl2ZXM6IERhdGEgbm90IGluaXRpYWxpemVkXCIpO1xuXG4gICAgbGV0IGNob3NlbiA9IFtdO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0byAwXG4gICAgZm9yIChsZXQgaT0wO2k8dGFibGVzLnN1cGVybGF0aXZlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIGNob3Nlbi5wdXNoKHtcbiAgICAgICAgICAgIGZpcnN0OiAwLFxuICAgICAgICAgICAgc2Vjb25kOiAwXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEZpbmQgY2hvc2VuXG4gICAgZm9yICggbGV0IGNob2ljZSBvZiB0YWJsZXMuc3VwZXJsYXRpdmVQbGFjZW1lbnRzICkge1xuICAgICAgICBpZiAoIGNob2ljZSAmJiBjaG9pY2UuanVkZ2VJZCA9PSBqdWRnZUlkICkge1xuICAgICAgICAgICAgY2hvc2VuW2Nob2ljZS5zdXBlcmxhdGl2ZUlkXS5maXJzdCA9IGNob2ljZS5maXJzdENob2ljZTtcbiAgICAgICAgICAgIGNob3NlbltjaG9pY2Uuc3VwZXJsYXRpdmVJZF0uc2Vjb25kID0gY2hvaWNlLnNlY29uZENob2ljZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjaG9zZW47XG59XG5zbGVkZ2UuZ2V0Q2hvc2VuU3VwZXJsYXRpdmVzID0gZ2V0Q2hvc2VuU3VwZXJsYXRpdmVzO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gT3RoZXIgRXhwb3J0c1xuXG5mdW5jdGlvbiBzdWJzY3JpYmUoY2IpIHtcbiAgICBzdWJzY3JpYmVycy5wdXNoKGNiKTtcbn1cbnNsZWRnZS5zdWJzY3JpYmUgPSBzdWJzY3JpYmU7XG5cbmZ1bmN0aW9uIGluaXQob3B0cykge1xuICAgIGlmIChzb2NrZXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2xlZGdlOiBTb2NrZXQgYWxyZWFkeSBpbml0aWFsaXplZCFcIik7XG4gICAgfVxuXG4gICAgc29ja2V0ID0gaW8oe3F1ZXJ5OiBcInNlY3JldD1cIitlbmNvZGVVUklDb21wb25lbnQob3B0cy50b2tlbil9KTtcblxuICAgIGZvciAobGV0IGggb2YgaGFuZGxlcnMpIHtcbiAgICAgICAgc29ja2V0Lm9uKGgubmFtZSwgaC5oYW5kbGVyKTtcbiAgICB9XG59XG5zbGVkZ2UuaW5pdCA9IGluaXQ7XG5cbmZ1bmN0aW9uIGluaXRXaXRoVGVzdERhdGEodGVzdGRhdGEpIHtcbiAgICB1cGRhdGVUYWJsZXModGVzdGRhdGEpO1xuICAgIGNvbnNvbGUubG9nKHRhYmxlcyk7XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgIHNlbmRDaGFuZ2Uoe1xuICAgICAgICAgICAgdHJhbnM6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogXCJmdWxsXCJcbiAgICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbn1cbnNsZWRnZS5pbml0V2l0aFRlc3REYXRhID0gaW5pdFdpdGhUZXN0RGF0YTtcblxufSkod2luZG93LnNsZWRnZSB8fCAod2luZG93LnNsZWRnZSA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvcGFnZXMvc2xlZGdlLmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIndpbmRvdy5sb2NhbFRlc3REYXRhID0ge1wiaGFja3NcIjpbbnVsbCx7XCJpZFwiOjEsXCJuYW1lXCI6XCJQcnVkZW50aWFsIENoYWxsZW5nZSAtIFVBXCIsXCJkZXNjcmlwdGlvblwiOlwiV2UgY3JlYXRlZCBhIHJlc3BvbnNpdmUgd2ViIGFwcCB0aGF0IHRyYW5zbGF0ZXMgc3BlZWNoIHRvIHRleHQgYW5kIGlucHV0cyBpdCBpbnRvIGEgcmVhbHRpbWUgZGF0YWJhc2UuXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MixcIm5hbWVcIjpcIlBydWRlbnRpYWwgSGFjayBSVSBDaGFsbGVuZ2UgMlwiLFwiZGVzY3JpcHRpb25cIjpcIkRldGVybWluZWQgY3VzdG9tZXJzIHdpdGggdGhlIGxvd2VzdCByaXNrIGJhc2VkIG9uIGEgcHJlZGljdGlvbiBvZiB3aGF0IHRoZWlyIHJpc2sgbGV2ZWwgd291bGQgYmVcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjozLFwibmFtZVwiOlwiUm9jay1QYXBlci1NeW9cIixcImRlc2NyaXB0aW9uXCI6XCJBIHJvY2ssIHBhcGVyLCBzY2lzc29ycyBtYWNoaW5lIHRoYXQgYWx3YXlzIGJlYXRzIHlvdSB1c2luZyB0aGUgTXlvIGFybWJhbmRcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjo0LFwibmFtZVwiOlwiTGF0cmluZS5JT1wiLFwiZGVzY3JpcHRpb25cIjpcImZhZHNmYWRzZlwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjUsXCJuYW1lXCI6XCJNYXlEYXlcIixcImRlc2NyaXB0aW9uXCI6XCJIdXJyaWNhbmU/IEVhcnRocXVha2U/IFRyeSBNYXlEYXkgLSBwdXNoIGEgYnV0dG9uIGFuZCBnZXQgYSBsaXN0IG9mIHZvbHVudGVlcnMgY2xvc2VzdCB0byB5b3UgdmlhIFNNUyFcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjo2LFwibmFtZVwiOlwiRGlhYmV0ZXMgRGlhZ25vc2UgYm94XCIsXCJkZXNjcmlwdGlvblwiOlwid2UgY2FuIGRpYWdub3NlIGRpYWJldGVzIGJhc2VkIG9uIHRoZSBpbmZvcm1hdGlvbiB0aGF0ICBwYXRpZW50cyBnaXZlIHVzXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6NyxcIm5hbWVcIjpcIlNpZ24tTy1NWU9cIixcImRlc2NyaXB0aW9uXCI6XCJBIGhhY2sgdG8gcXVpeiB5b3Vyc2VsZiBvbiBBbWVyaWNhbiBTaWduIExhbmd1YWdlIHVzaW5nIGEgTXlvIEFybWJhbmRcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjo4LFwibmFtZVwiOlwiVGV4dCBNZShtZSlcIixcImRlc2NyaXB0aW9uXCI6XCJBIGZhc3QgYW5kIGNvbnZlbmllbnQgd2F5IHRvIGNyZWF0ZSBtZW1lcyB3aXRoIHlvdXIgcGVyc29uYWwgbWVzc2FnZSBhbmQgdGhlbiBzZW5kIHRoZSBtZW1lIHRvIHNvbWVvbmUuXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6OSxcIm5hbWVcIjpcIk1lZGljdGF0aW9uXCIsXCJkZXNjcmlwdGlvblwiOlwiV2Vic2l0ZSBhbmQgdGV4dCBtZXNzYWdlIHN5c3RlbSB0byBtYWtlIHRha2luZyBtZWRpY2F0aW9uIGVhc2llclwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjEwLFwibmFtZVwiOlwiY2F0ZWdvcmljYWxfdGltZV9zZXJpZXNfdmlzdWFsaXphdGlvblwiLFwiZGVzY3JpcHRpb25cIjpcImlubm92YXRpdmUgaW1wbGVtZW50YXRpb24gb2YgTUNBIHRvIHZpc3VhbGl6ZSB0aW1lIHNlcmllcyBkYXRhIHdpdGggY2F0ZWdvcmljYWwgYXR0cmlidXRlc1wiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjExLFwibmFtZVwiOlwiU3BsaXQuYWlcIixcImRlc2NyaXB0aW9uXCI6XCJTcGxpdC5haSBpcyBhIHVzZXIgZnJpZW5kbHksIGNsZWFuIGludGVyZmFjZSB0YWIgc3BsaXQgdGhhdCBzdW1tZXJpemVzIHRvdGFscyBmb3IgZWFjaCBwZXJzb24gaW4gdGhlIGdyb3VwLlwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjEyLFwibmFtZVwiOlwiRGVscGhpXCIsXCJkZXNjcmlwdGlvblwiOlwiUHJlZGljdCBUaGUgTW9zdCBFZmZlY3RpdmUgTWFya2V0aW5nIFN0cmF0ZWd5IGZvciBJbnN1cmFuY2VcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjoxMyxcIm5hbWVcIjpcImNhbGNHb2dnbGVzXCIsXCJkZXNjcmlwdGlvblwiOlwiYSBjbGFzc3Jvb20gdG9vbCB0byBoZWxwIHdpdGggdmlzdWFsaXppbmcgc3RyYW5nZSBzb2xpZHNcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjoxNCxcIm5hbWVcIjpcIlBheSBTdG9yZVwiLFwiZGVzY3JpcHRpb25cIjpcIkEgZGlzdHJpYnV0ZWQgcGxhdGZvcm0gZm9yIGZpbmFuY2lhbCBhcHBzIVwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjE1LFwibmFtZVwiOlwiU3UgUHJ1ZGVudGlhbCBoYWNrIHJ1IENoYWxsZW5nZVwiLFwiZGVzY3JpcHRpb25cIjpcImRhdGEgYW5hbHlzaXNcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjoxNixcIm5hbWVcIjpcIlRlY2guRGVjbGFzc2lmaWVkXCIsXCJkZXNjcmlwdGlvblwiOlwiQSBOYXR1cmFsIExhbmd1YWdlIFByb2Nlc3NvciBiYXNlZCBjbGFzc2lmaWVyIGZvciBUZWNoIHJlbGF0ZWQgQXJ0aWNsZXMhXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MTcsXCJuYW1lXCI6XCJIYW5kd3JpdHRlbiBFeHByZXNzaW9uIEV2YWx1YXRvclwiLFwiZGVzY3JpcHRpb25cIjpcIlNvbHZlIGFueSBhcml0aG1ldGljIGhhbmR3cml0dGVuIG1hdGhlbWF0aWNhbCBleHByZXNzaW9uIGluc3RhbnRseSB3aXRoIE1hY2hpbmUgTGVhcm5pbmdcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjoxOCxcIm5hbWVcIjpcIldlYlJlZyBIZWxwZXJcIixcImRlc2NyaXB0aW9uXCI6XCJHZXQgcmF0ZSBteSBwcm9mZXNzb3IgZWFzaWVyXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MTksXCJuYW1lXCI6XCJSdXRnZXJzLVJhdGlvXCIsXCJkZXNjcmlwdGlvblwiOlwiRGlzY292ZXIgdGhlIGRldGFpbHMgb2YgcGFydGllcyBhaGVhZCBvZiB0aW1lIHNvIHlvdSBwaWNrIHRoZSBiZXN0IG9uZVwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjIwLFwibmFtZVwiOlwiSW5zaWdodHNcIixcImRlc2NyaXB0aW9uXCI6XCJUaGlzIGRhc2hib2FyZCBoZWxwcyB5b3UgZGV0ZXJtaW5lIHRoZSBtb3N0IGltcG9ydGFudCBjdXN0b21lcnNcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjoyMSxcIm5hbWVcIjpcIlJVIEV2ZW50c1wiLFwiZGVzY3JpcHRpb25cIjpcIlJVIEV2ZW50cyBpcyBhbiBBbmRyb2lkIEFwcGxpY2F0aW9uIHRvIGZldGNoL1JTVlAvbm90aWZ5L3NlYXJjaCBGYWNlYm9vayBldmVudHMgaGFwcGVuaW5nIGF0IFJ1dGdlcnMhXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MjIsXCJuYW1lXCI6XCJXZWF0aGVyQXBwXCIsXCJkZXNjcmlwdGlvblwiOlwiR2V0IHdlYXRoZXIgZWFzaWVyXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MjMsXCJuYW1lXCI6XCJBbGxpZ2F0b3JcIixcImRlc2NyaXB0aW9uXCI6XCJBIGJldHRlciB3YXkgdG8gbGVhcm4gd2l0aCBmbGFzaGNhcmRzXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MjQsXCJuYW1lXCI6XCJQcnVkZW50aWFsIERhdGEgQW5hbHlzaXNcIixcImRlc2NyaXB0aW9uXCI6XCJEZXRlcm1pbmluZyB3aGljaCBjbGllbnRzIGhhdmUgdGhlIGhpZ2hlc3QgcmlzayBmYWN0b3JzIGJhc2VkIG9uIGhlYWx0aCwgZmFtaWx5IGhpc3RvcnksIGFuZCBvdGhlciBmYWN0b3JzXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MjUsXCJuYW1lXCI6XCJGbHkgQ2hvY29ibyFcIixcImRlc2NyaXB0aW9uXCI6XCJBIGJhYnkgY2hvY29ibyBmbGFwcyBpdHMgcG93ZXJmdWwgd2luZ3MgYWdhaW5zdCB0aGUgcG93ZXIgb2YgZ3Jhdml0eSB0byBtYW5ldXZlciBhbmQgZGVzdHJveSBhbnl0aGluZyBpbiBpdHMgcGF0aC5cIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjoyNixcIm5hbWVcIjpcIk5vc2VkaXZlXCIsXCJkZXNjcmlwdGlvblwiOlwiRmFjaWFsIFJlY29nbml0aW9uIGFwcGxpY2F0aW9uIHRoYXQgY29ubmVjdHMgdXNlcnMgYnkgdGhlaXIgc29jaWFsIG1lZGlhIGFjY291bnRzXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MjcsXCJuYW1lXCI6XCJIb3cgUlUgRmVlbGluZz9cIixcImRlc2NyaXB0aW9uXCI6XCJBY2VkIHRoYXQgZXhhbT9DcmFtcGVkIGluIGEgTFg/R2V0IHNlbnQgdG8gYSBSdXRnZXJzLXRoZW1lZCBVUkwgdG8gZml0IHlvdXIgbW9vZCtzaGFyZSBpdCB3LyBmcmllbmRzIGJ5IFNNUyBtZXNzYWdpbmdcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjoyOCxcIm5hbWVcIjpcIkN1dHRpbmcgRWRnZVwiLFwiZGVzY3JpcHRpb25cIjpcIkR5bmFtaWMgY3V0dGluZyB0aGF0IGN1dHMgb2JqZWN0cyB3aGVyZSB0aGUgc3dvcmQgc2xpY2VzIGludG8gdGhlbS4gSXQgaXMgb25lIHRvIG9uZSB3aXRoIHRoZSB1c2VyJ3Mgc3dpbmdzXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MjksXCJuYW1lXCI6XCJIYWNrUnVcIixcImRlc2NyaXB0aW9uXCI6XCJBIHByZWRpY3RpdmUgbW9kZWwgdG8gZG8gYSByaXNrIGFzc2Vzc21lbnQgb2YgY2xpZW50cyBmb3IgbGlmZSBpbnN1cmFuY2UuXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MzAsXCJuYW1lXCI6XCJSZS1DYWxsXCIsXCJkZXNjcmlwdGlvblwiOlwiV2hldGhlciBpdCdzIGEgY29uZmVyZW5jZSBjYWxsIG9yIGEgcGhvbmUgaW50ZXJ2aWV3LCB5b3UgbmV2ZXIgaGF2ZSB0byBmb3JnZXQgeW91ciBpbXBvcnRhbnQgY29udmVyc2F0aW9ucyBhZ2FpbiFcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjozMSxcIm5hbWVcIjpcIkxlYXAgTW90aW9uIGNvbnRyb2xsZWQgQ29tcHV0ZXJcIixcImRlc2NyaXB0aW9uXCI6XCJVc2luZyBhIG1vdXNlIG9yIHRvdWNoaW5nIGNvbXB1dGVyIHNjcmVlbiBpcyBub3QgYWx3YXlzIGVhc3kuIExldCdzIGNvbnRyb2wgaXQgYnkgZ2VzdHVyZXMgaW4gdGhlIGFpciBkZWZpbmVkIGJ5IHVzXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MzIsXCJuYW1lXCI6XCJNZWF0IE1lXCIsXCJkZXNjcmlwdGlvblwiOlwiQXJlIHlvdSBhIGxvbmUgZGluZXJzPyBNZWF0IE1lIGlzIHlvdXIgc29sdXRpb24uIExldCdzIGNoYXQgYW5kIGVhdCB1cCB3aXRoIHJlYWwgcGVvcGxlIVwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjMzLFwibmFtZVwiOlwiTWVldCBVcFwiLFwiZGVzY3JpcHRpb25cIjpcIkEgc29jaWFsIHBsYXRmb3JtIGZvciBnZXR0aW5nIHRvZ2V0aGVyIHdpdGggeW91ciBmcmllbmRzIHNob3J0LXRlcm1cIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjozNCxcIm5hbWVcIjpcIlByb2plY3Q6IFBpbiBVcCBTdWJzY3JpcHRpb25cIixcImRlc2NyaXB0aW9uXCI6XCJLZWVwIHRyYWNrIG9mIHN1YnNjcmlwdGlvbiBhbmQgcHVyY2hhc2VzIGFsbCBpbiBvbmUsIGFsb25nIHdpdGggYW55IGZpbmljYWwgcGxhbm5pbmchXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MzUsXCJuYW1lXCI6XCJJbnN1cmFuY2UgVGV4dCBGaWxsZXJcIixcImRlc2NyaXB0aW9uXCI6XCJUaGlzIGFwcCBtYWtlcyBmaWxsaW5nIGluIGFwcGxpY2F0aW9ucyBlYXN5IGZvciB5b3UgYnkgdXNpbmcgc3BlZWNoIHRvIHRleHQgYW5kIHNjYW5zIHlvdXIgSUQgdG8gYXV0byBmaWxsIGVudHJpZXNcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjozNixcIm5hbWVcIjpcIlZpcnR1YWxvc29cIixcImRlc2NyaXB0aW9uXCI6XCJBIHZpcnR1YWwgTUlESSBrZXlib2FyZCB0aGF0IGlzIGZhciBtb3JlIHBvcnRhYmxlIHRoYW4gYSBzdGFuZGFyZCBrZXlib2FyZCBhbmQgYWxsb3dzIGZvciBtb3JlIGZsdWlkIG11c2ljIHByb2R1Y3Rpb25cIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjozNyxcIm5hbWVcIjpcIk11bHRpcGxheWVyIFdpemFyZCBPbmxpbmVcIixcImRlc2NyaXB0aW9uXCI6XCJXaXphcmRzIHJ1bm5pbmcgYXJvdW5kIGRlc3Ryb3lpbmcgZWFjaCBvdGhlciB3aXRoIGEgdmFyaWV0eSBvZiBzcGVsbHNcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjozOCxcIm5hbWVcIjpcImV2ZW50TGFiXCIsXCJkZXNjcmlwdGlvblwiOlwiQSBwbGF0Zm9ybSBmb3IgY29vcmRpbmF0aW5nIGFuZCBhbmFseXppbmcgZXZlbnRzXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6MzksXCJuYW1lXCI6XCJIYXZlIERlbnRhbD8gR2V0IEFjY2ktZGVudGFsXCIsXCJkZXNjcmlwdGlvblwiOlwiUXVpY2tseSB2aXN1YWxpemUgaG93IGN1c3RvbWVycyBhcmUgcHVyY2hhc2luZyB5b3VyIGluc3VyYW5jZVwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjQwLFwibmFtZVwiOlwiR29vZCBCdXNpbmVzcyBJbmRpY2F0b3JzXCIsXCJkZXNjcmlwdGlvblwiOlwiTW9kZWwgdG8gaW5kaWNhdGUgYW5kIGZpbmQgYSBsb3cgcmlzayBpbnN1cmVyXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6NDEsXCJuYW1lXCI6XCJydXRnZXJzYi51c1wiLFwiZGVzY3JpcHRpb25cIjpcIkEgdG9vbCB0byBuYXZpZ2F0ZSB0aGUgYnVzIHN5c3RlbSBmb3Igc2NhcmVkIGZyZXNobWVuLCBieSBhIHNjYXJlZCBmcmVzaG1hblwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjQyLFwibmFtZVwiOlwiSGFja1JVX1ZpdGVjaF9DaGFsbGVuZ2VcIixcImRlc2NyaXB0aW9uXCI6XCJEZWVwIExlYXJuaW5nIFBsYXRmb3JtIGNhcGFibGUgb2Ygc3VjY2Vzc2Z1bGx5IHByZWRpY3RpbmcgdGhlIGxpa2VsaWhvb2Qgb2YgYSBwZXJzb24gcHVyY2hhc2luZyBhbiBpbnN1cmFuY2Ugb3B0aW9uXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6NDMsXCJuYW1lXCI6XCJEYXRhIFZpenVhbGl6YXRpb25cIixcImRlc2NyaXB0aW9uXCI6XCJkYXRhIGFuYWx5c2lzLCB2aXN1YWxpemF0aW9uLCB3ZWIgYXBwLlwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjQ0LFwibmFtZVwiOlwiQnJpZ2h0bmVzc19DdXJ2ZShDb25jZXB0KVwiLFwiZGVzY3JpcHRpb25cIjpcIlRoZSBhdXRvLWJyaWdodG5lc3Mgb24geW91ciBwaG9uZSBpc250IHRoZSBtb3N0IGVmZmljaWVudC4gV2h5IGNhbnQgaXQgYmUgYXMgZWFzeSBhcyBzZXR0aW5nIGEgZmFuIGN1cnZlLlwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjQ1LFwibmFtZVwiOlwiTmltYmxlIE5vcnNlIDJcIixcImRlc2NyaXB0aW9uXCI6XCJTZXF1ZWwgdG8gYW4gaW5maW5pdGUgcnVubmVyIG1hZGUgaW4gc2VuaW9yIHllYXIgb2YgaGlnaCBzY2hvb2xcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjo0NixcIm5hbWVcIjpcIkhvbWVjYXJlXCIsXCJkZXNjcmlwdGlvblwiOlwiQW4gYXBwIHRoYXQgcHJvdmlkZXMgcGF0aWVudHMgd2l0aCBhIHBsYXRmb3JtIHRvIGdhaW4gbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGVpciBvcnRob3BlZGljIGluanVyaWVzLlwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjQ3LFwibmFtZVwiOlwiUHl0aG9uIFR1dG9yaWFsXCIsXCJkZXNjcmlwdGlvblwiOlwiSSdtIHRlYWNoaW5nIG15c2VsZiBweXRob24hXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6NDgsXCJuYW1lXCI6XCJQcnVkZW50aWFsIFJpc2sgRXZhbHVhdGlvbjogTW9kZWxpbmcgJiBWaXN1YWxpemF0aW9uc1wiLFwiZGVzY3JpcHRpb25cIjpcIlN1Ym1pc3Npb24gZm9yIFBydWRlbnRpYWwncyBDaGFsbGVuZ2UgIzI6IEZlYXR1cmVzIFIgQ29kZSwgdmlzdWFsaXphdGlvbiBhbmQgUHl0aG9uIHF1ZXJ5XCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6NDksXCJuYW1lXCI6XCJTbWFydCBDYW1lcmFcIixcImRlc2NyaXB0aW9uXCI6XCJBIGNvbWJpbmF0aW9uIG9mIGEgd2ViY2FtIGFuZCBhIFJhc2JlcnJ5IFBpIGFsbG93cyB5b3UgdG8gcHJvdGVjdCB5b3VyIGhvbWUgZnJvbSBidXJnbGFycyB3aXRob3V0IHNwZW5kaW5nIGh1bmRyZWRzLlwiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjUwLFwibmFtZVwiOlwiQ2FwaXRhbCBPbmUgQnVkZ2V0aW5nIEFwcFwiLFwiZGVzY3JpcHRpb25cIjpcIkFuIGFwcCB0byB0cmFjayB5b3VyIG1vbmV5IHVzYWdlIGluIHlvdXIgQ2FwaXRhbCBPbmUgYWNjb3VudCAtIGJyb3VnaHQgdG8geW91IGJ5IFRlYW0gTU1ZS1wiLFwibG9jYXRpb25cIjowfSx7XCJpZFwiOjUxLFwibmFtZVwiOlwibmVlZCBtb3JlIHJlYWRlcnNcIixcImRlc2NyaXB0aW9uXCI6XCJkZXRlcm1pbmUgZ29vZCB3YXlzIHRvIGluc3BpcmUgYmV0dGVyIHdyaXRpbmdcIixcImxvY2F0aW9uXCI6MH0se1wiaWRcIjo1MixcIm5hbWVcIjpcIkRyaXZlcnMgSUQgU2Nhbm5lclwiLFwiZGVzY3JpcHRpb25cIjpcIlNjYW4gaW5mb3JtYXRpb24gZnJvbSBhIGRyaXZlcnMgSUQgdG8gYXV0b2ZpbGwgcmVnaXN0cmF0aW9uIGZvcm1zXCIsXCJsb2NhdGlvblwiOjB9LHtcImlkXCI6NTMsXCJuYW1lXCI6XCJBdCBsZWFzdCBpdCdzIGEgc3VibWlzc2lvbiByaWdodD9cIixcImRlc2NyaXB0aW9uXCI6XCJJIGp1c3Qgd2FudCB0byBiZSBlbnRlcmVkIGludG8gYSBwcml6ZVwiLFwibG9jYXRpb25cIjowfV0sXCJqdWRnZXNcIjpbbnVsbCx7XCJpZFwiOjEsXCJuYW1lXCI6XCJUZXN0IEp1ZGdlXCIsXCJlbWFpbFwiOlwidGVzdEB0ZXN0LmNvbVwifSx7XCJpZFwiOjIsXCJuYW1lXCI6XCJKdWRnZSAyXCIsXCJlbWFpbFwiOlwianVkZ2UyXCJ9LHtcImlkXCI6MyxcIm5hbWVcIjpcIkp1ZGdlIDNcIixcImVtYWlsXCI6XCJqdWRnZTNcIn0se1wiaWRcIjo0LFwibmFtZVwiOlwiSnVkZ2UgNFwiLFwiZW1haWxcIjpcImp1ZGdlNVwifSx7XCJpZFwiOjUsXCJuYW1lXCI6XCJKdWRnZSA1XCIsXCJlbWFpbFwiOlwianVkZ2U1XCJ9XSxcImp1ZGdlSGFja3NcIjpbbnVsbCx7XCJpZFwiOjEsXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjEsXCJwcmlvcml0eVwiOjB9LHtcImlkXCI6MixcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MixcInByaW9yaXR5XCI6MX0se1wiaWRcIjozLFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjozLFwicHJpb3JpdHlcIjoyfSx7XCJpZFwiOjQsXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjQsXCJwcmlvcml0eVwiOjN9LHtcImlkXCI6NSxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6NSxcInByaW9yaXR5XCI6NH0se1wiaWRcIjo2LFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjo2LFwicHJpb3JpdHlcIjo1fSx7XCJpZFwiOjcsXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjcsXCJwcmlvcml0eVwiOjZ9LHtcImlkXCI6OCxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6OCxcInByaW9yaXR5XCI6N30se1wiaWRcIjo5LFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjo5LFwicHJpb3JpdHlcIjo4fSx7XCJpZFwiOjEwLFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjoxMCxcInByaW9yaXR5XCI6OX0se1wiaWRcIjoxMSxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MTEsXCJwcmlvcml0eVwiOjEwfSx7XCJpZFwiOjEyLFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjoxMixcInByaW9yaXR5XCI6MTF9LHtcImlkXCI6MTMsXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjEzLFwicHJpb3JpdHlcIjoxMn0se1wiaWRcIjoxNCxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MTQsXCJwcmlvcml0eVwiOjEzfSx7XCJpZFwiOjE1LFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjoxNSxcInByaW9yaXR5XCI6MTR9LHtcImlkXCI6MTYsXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjE2LFwicHJpb3JpdHlcIjoxNX0se1wiaWRcIjoxNyxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MTcsXCJwcmlvcml0eVwiOjE2fSx7XCJpZFwiOjE4LFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjoxOCxcInByaW9yaXR5XCI6MTd9LHtcImlkXCI6MTksXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjE5LFwicHJpb3JpdHlcIjoxOH0se1wiaWRcIjoyMCxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MjAsXCJwcmlvcml0eVwiOjE5fSx7XCJpZFwiOjIxLFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjoyMSxcInByaW9yaXR5XCI6MjB9LHtcImlkXCI6MjIsXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjIyLFwicHJpb3JpdHlcIjoyMX0se1wiaWRcIjoyMyxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MjMsXCJwcmlvcml0eVwiOjIyfSx7XCJpZFwiOjI0LFwianVkZ2VJZFwiOjIsXCJoYWNrSWRcIjoxNCxcInByaW9yaXR5XCI6MH0se1wiaWRcIjoyNSxcImp1ZGdlSWRcIjoyLFwiaGFja0lkXCI6MTUsXCJwcmlvcml0eVwiOjF9LHtcImlkXCI6MjYsXCJqdWRnZUlkXCI6MixcImhhY2tJZFwiOjE2LFwicHJpb3JpdHlcIjoyfSx7XCJpZFwiOjI3LFwianVkZ2VJZFwiOjIsXCJoYWNrSWRcIjoxNyxcInByaW9yaXR5XCI6M30se1wiaWRcIjoyOCxcImp1ZGdlSWRcIjoyLFwiaGFja0lkXCI6MTgsXCJwcmlvcml0eVwiOjR9LHtcImlkXCI6MjksXCJqdWRnZUlkXCI6MixcImhhY2tJZFwiOjE5LFwicHJpb3JpdHlcIjo1fSx7XCJpZFwiOjMwLFwianVkZ2VJZFwiOjIsXCJoYWNrSWRcIjoyMCxcInByaW9yaXR5XCI6Nn0se1wiaWRcIjozMSxcImp1ZGdlSWRcIjoyLFwiaGFja0lkXCI6MjEsXCJwcmlvcml0eVwiOjd9LHtcImlkXCI6MzIsXCJqdWRnZUlkXCI6MixcImhhY2tJZFwiOjIyLFwicHJpb3JpdHlcIjo4fSx7XCJpZFwiOjMzLFwianVkZ2VJZFwiOjIsXCJoYWNrSWRcIjoyMyxcInByaW9yaXR5XCI6OX0se1wiaWRcIjozNCxcImp1ZGdlSWRcIjoyLFwiaGFja0lkXCI6MjQsXCJwcmlvcml0eVwiOjEwfSx7XCJpZFwiOjM1LFwianVkZ2VJZFwiOjIsXCJoYWNrSWRcIjoyNSxcInByaW9yaXR5XCI6MTF9LHtcImlkXCI6MzYsXCJqdWRnZUlkXCI6MixcImhhY2tJZFwiOjI2LFwicHJpb3JpdHlcIjoxMn0se1wiaWRcIjozNyxcImp1ZGdlSWRcIjoyLFwiaGFja0lkXCI6MjcsXCJwcmlvcml0eVwiOjEzfSx7XCJpZFwiOjM4LFwianVkZ2VJZFwiOjIsXCJoYWNrSWRcIjoyOCxcInByaW9yaXR5XCI6MTR9LHtcImlkXCI6MzksXCJqdWRnZUlkXCI6MixcImhhY2tJZFwiOjI5LFwicHJpb3JpdHlcIjoxNX0se1wiaWRcIjo0MCxcImp1ZGdlSWRcIjoyLFwiaGFja0lkXCI6MzAsXCJwcmlvcml0eVwiOjE2fSx7XCJpZFwiOjQxLFwianVkZ2VJZFwiOjIsXCJoYWNrSWRcIjozMSxcInByaW9yaXR5XCI6MTd9LHtcImlkXCI6NDIsXCJqdWRnZUlkXCI6MixcImhhY2tJZFwiOjMyLFwicHJpb3JpdHlcIjoxOH0se1wiaWRcIjo0MyxcImp1ZGdlSWRcIjoyLFwiaGFja0lkXCI6MzMsXCJwcmlvcml0eVwiOjE5fSx7XCJpZFwiOjQ0LFwianVkZ2VJZFwiOjMsXCJoYWNrSWRcIjoyNCxcInByaW9yaXR5XCI6MH0se1wiaWRcIjo0NSxcImp1ZGdlSWRcIjozLFwiaGFja0lkXCI6MjUsXCJwcmlvcml0eVwiOjF9LHtcImlkXCI6NDYsXCJqdWRnZUlkXCI6MyxcImhhY2tJZFwiOjI2LFwicHJpb3JpdHlcIjoyfSx7XCJpZFwiOjQ3LFwianVkZ2VJZFwiOjMsXCJoYWNrSWRcIjoyNyxcInByaW9yaXR5XCI6M30se1wiaWRcIjo0OCxcImp1ZGdlSWRcIjozLFwiaGFja0lkXCI6MjgsXCJwcmlvcml0eVwiOjR9LHtcImlkXCI6NDksXCJqdWRnZUlkXCI6MyxcImhhY2tJZFwiOjI5LFwicHJpb3JpdHlcIjo1fSx7XCJpZFwiOjUwLFwianVkZ2VJZFwiOjMsXCJoYWNrSWRcIjozMCxcInByaW9yaXR5XCI6Nn0se1wiaWRcIjo1MSxcImp1ZGdlSWRcIjozLFwiaGFja0lkXCI6MzEsXCJwcmlvcml0eVwiOjd9LHtcImlkXCI6NTIsXCJqdWRnZUlkXCI6MyxcImhhY2tJZFwiOjMyLFwicHJpb3JpdHlcIjo4fSx7XCJpZFwiOjUzLFwianVkZ2VJZFwiOjMsXCJoYWNrSWRcIjozMyxcInByaW9yaXR5XCI6OX0se1wiaWRcIjo1NCxcImp1ZGdlSWRcIjozLFwiaGFja0lkXCI6MzQsXCJwcmlvcml0eVwiOjEwfSx7XCJpZFwiOjU1LFwianVkZ2VJZFwiOjMsXCJoYWNrSWRcIjozNSxcInByaW9yaXR5XCI6MTF9LHtcImlkXCI6NTYsXCJqdWRnZUlkXCI6MyxcImhhY2tJZFwiOjM2LFwicHJpb3JpdHlcIjoxMn0se1wiaWRcIjo1NyxcImp1ZGdlSWRcIjozLFwiaGFja0lkXCI6MzcsXCJwcmlvcml0eVwiOjEzfSx7XCJpZFwiOjU4LFwianVkZ2VJZFwiOjMsXCJoYWNrSWRcIjozOCxcInByaW9yaXR5XCI6MTR9LHtcImlkXCI6NTksXCJqdWRnZUlkXCI6MyxcImhhY2tJZFwiOjM5LFwicHJpb3JpdHlcIjoxNX0se1wiaWRcIjo2MCxcImp1ZGdlSWRcIjozLFwiaGFja0lkXCI6NDAsXCJwcmlvcml0eVwiOjE2fSx7XCJpZFwiOjYxLFwianVkZ2VJZFwiOjMsXCJoYWNrSWRcIjo0MSxcInByaW9yaXR5XCI6MTd9LHtcImlkXCI6NjIsXCJqdWRnZUlkXCI6MyxcImhhY2tJZFwiOjQyLFwicHJpb3JpdHlcIjoxOH0se1wiaWRcIjo2MyxcImp1ZGdlSWRcIjozLFwiaGFja0lkXCI6NDMsXCJwcmlvcml0eVwiOjE5fSx7XCJpZFwiOjY0LFwianVkZ2VJZFwiOjQsXCJoYWNrSWRcIjozNCxcInByaW9yaXR5XCI6MH0se1wiaWRcIjo2NSxcImp1ZGdlSWRcIjo0LFwiaGFja0lkXCI6MzUsXCJwcmlvcml0eVwiOjF9LHtcImlkXCI6NjYsXCJqdWRnZUlkXCI6NCxcImhhY2tJZFwiOjM2LFwicHJpb3JpdHlcIjoyfSx7XCJpZFwiOjY3LFwianVkZ2VJZFwiOjQsXCJoYWNrSWRcIjozNyxcInByaW9yaXR5XCI6M30se1wiaWRcIjo2OCxcImp1ZGdlSWRcIjo0LFwiaGFja0lkXCI6MzgsXCJwcmlvcml0eVwiOjR9LHtcImlkXCI6NjksXCJqdWRnZUlkXCI6NCxcImhhY2tJZFwiOjM5LFwicHJpb3JpdHlcIjo1fSx7XCJpZFwiOjcwLFwianVkZ2VJZFwiOjQsXCJoYWNrSWRcIjo0MCxcInByaW9yaXR5XCI6Nn0se1wiaWRcIjo3MSxcImp1ZGdlSWRcIjo0LFwiaGFja0lkXCI6NDEsXCJwcmlvcml0eVwiOjd9LHtcImlkXCI6NzIsXCJqdWRnZUlkXCI6NCxcImhhY2tJZFwiOjQyLFwicHJpb3JpdHlcIjo4fSx7XCJpZFwiOjczLFwianVkZ2VJZFwiOjQsXCJoYWNrSWRcIjo0MyxcInByaW9yaXR5XCI6OX0se1wiaWRcIjo3NCxcImp1ZGdlSWRcIjo0LFwiaGFja0lkXCI6NDQsXCJwcmlvcml0eVwiOjEwfSx7XCJpZFwiOjc1LFwianVkZ2VJZFwiOjQsXCJoYWNrSWRcIjo0NSxcInByaW9yaXR5XCI6MTF9LHtcImlkXCI6NzYsXCJqdWRnZUlkXCI6NCxcImhhY2tJZFwiOjQ2LFwicHJpb3JpdHlcIjoxMn0se1wiaWRcIjo3NyxcImp1ZGdlSWRcIjo0LFwiaGFja0lkXCI6NDcsXCJwcmlvcml0eVwiOjEzfSx7XCJpZFwiOjc4LFwianVkZ2VJZFwiOjQsXCJoYWNrSWRcIjo0OCxcInByaW9yaXR5XCI6MTR9LHtcImlkXCI6NzksXCJqdWRnZUlkXCI6NCxcImhhY2tJZFwiOjQ5LFwicHJpb3JpdHlcIjoxNX0se1wiaWRcIjo4MCxcImp1ZGdlSWRcIjo0LFwiaGFja0lkXCI6NTAsXCJwcmlvcml0eVwiOjE2fSx7XCJpZFwiOjgxLFwianVkZ2VJZFwiOjQsXCJoYWNrSWRcIjo1MSxcInByaW9yaXR5XCI6MTd9LHtcImlkXCI6ODIsXCJqdWRnZUlkXCI6NCxcImhhY2tJZFwiOjUyLFwicHJpb3JpdHlcIjoxOH0se1wiaWRcIjo4MyxcImp1ZGdlSWRcIjo0LFwiaGFja0lkXCI6NTMsXCJwcmlvcml0eVwiOjE5fSx7XCJpZFwiOjg0LFwianVkZ2VJZFwiOjUsXCJoYWNrSWRcIjo0NCxcInByaW9yaXR5XCI6MH0se1wiaWRcIjo4NSxcImp1ZGdlSWRcIjo1LFwiaGFja0lkXCI6NDUsXCJwcmlvcml0eVwiOjF9LHtcImlkXCI6ODYsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjQ2LFwicHJpb3JpdHlcIjoyfSx7XCJpZFwiOjg3LFwianVkZ2VJZFwiOjUsXCJoYWNrSWRcIjo0NyxcInByaW9yaXR5XCI6M30se1wiaWRcIjo4OCxcImp1ZGdlSWRcIjo1LFwiaGFja0lkXCI6NDgsXCJwcmlvcml0eVwiOjR9LHtcImlkXCI6ODksXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjQ5LFwicHJpb3JpdHlcIjo1fSx7XCJpZFwiOjkwLFwianVkZ2VJZFwiOjUsXCJoYWNrSWRcIjo1MCxcInByaW9yaXR5XCI6Nn0se1wiaWRcIjo5MSxcImp1ZGdlSWRcIjo1LFwiaGFja0lkXCI6NTEsXCJwcmlvcml0eVwiOjd9LHtcImlkXCI6OTIsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjUyLFwicHJpb3JpdHlcIjo4fSx7XCJpZFwiOjkzLFwianVkZ2VJZFwiOjUsXCJoYWNrSWRcIjo1MyxcInByaW9yaXR5XCI6OX0se1wiaWRcIjo5NCxcImp1ZGdlSWRcIjo1LFwiaGFja0lkXCI6MSxcInByaW9yaXR5XCI6MTB9LHtcImlkXCI6OTUsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjIsXCJwcmlvcml0eVwiOjExfSx7XCJpZFwiOjk2LFwianVkZ2VJZFwiOjUsXCJoYWNrSWRcIjozLFwicHJpb3JpdHlcIjoxMn0se1wiaWRcIjo5NyxcImp1ZGdlSWRcIjo1LFwiaGFja0lkXCI6NCxcInByaW9yaXR5XCI6MTN9LHtcImlkXCI6OTgsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjUsXCJwcmlvcml0eVwiOjE0fSx7XCJpZFwiOjk5LFwianVkZ2VJZFwiOjUsXCJoYWNrSWRcIjo2LFwicHJpb3JpdHlcIjoxNX0se1wiaWRcIjoxMDAsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjcsXCJwcmlvcml0eVwiOjE2fSx7XCJpZFwiOjEwMSxcImp1ZGdlSWRcIjo1LFwiaGFja0lkXCI6OCxcInByaW9yaXR5XCI6MTd9LHtcImlkXCI6MTAyLFwianVkZ2VJZFwiOjUsXCJoYWNrSWRcIjo5LFwicHJpb3JpdHlcIjoxOH0se1wiaWRcIjoxMDMsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjEwLFwicHJpb3JpdHlcIjoxOX0se1wiaWRcIjoxMDQsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjExLFwicHJpb3JpdHlcIjoyMH0se1wiaWRcIjoxMDUsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjEyLFwicHJpb3JpdHlcIjoyMX0se1wiaWRcIjoxMDYsXCJqdWRnZUlkXCI6NSxcImhhY2tJZFwiOjEzLFwicHJpb3JpdHlcIjoyMn1dLFwic3VwZXJsYXRpdmVzXCI6W251bGwse1wiaWRcIjoxLFwibmFtZVwiOlwiSG9ycmlibGUgVGVycmlibGUgQmFkIGFuZCBEaXNndXN0aW5nXCJ9LHtcImlkXCI6MixcIm5hbWVcIjpcIk1vc3QgT2ZmZW5zaXZlXCJ9LHtcImlkXCI6MyxcIm5hbWVcIjpcIk1pY2t5IHlvdSBzdWNrXCJ9XSxcInN1cGVybGF0aXZlUGxhY2VtZW50c1wiOltudWxsLHtcImlkXCI6MSxcImp1ZGdlSWRcIjoxLFwic3VwZXJsYXRpdmVJZFwiOjEsXCJmaXJzdENob2ljZVwiOjEsXCJzZWNvbmRDaG9pY2VcIjowfSx7XCJpZFwiOjIsXCJqdWRnZUlkXCI6MSxcInN1cGVybGF0aXZlSWRcIjozLFwiZmlyc3RDaG9pY2VcIjo0LFwic2Vjb25kQ2hvaWNlXCI6MH1dLFwicmF0aW5nc1wiOltudWxsLHtcImlkXCI6MSxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MjcsXCJyYXRpbmdcIjoxfSx7XCJpZFwiOjIsXCJqdWRnZUlkXCI6MSxcImhhY2tJZFwiOjMxLFwicmF0aW5nXCI6MTF9LHtcImlkXCI6MyxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MSxcInJhdGluZ1wiOjl9LHtcImlkXCI6NCxcImp1ZGdlSWRcIjoxLFwiaGFja0lkXCI6MjgsXCJyYXRpbmdcIjotMX0se1wiaWRcIjo1LFwianVkZ2VJZFwiOjEsXCJoYWNrSWRcIjo0LFwicmF0aW5nXCI6OX1dfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NsaWVudC9wYWdlcy90ZXN0ZGF0YS5qc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIHRvZ2dsZUNsYXNzKHRvZ2dsZSwgb25DbGFzcywgb2ZmQ2xhc3MpIHtcbiAgICBpZiAoIHRvZ2dsZSAmJiBvbkNsYXNzICkge1xuICAgICAgICByZXR1cm4gXCIgXCIrb25DbGFzcztcbiAgICB9IGVsc2UgaWYgKCAhdG9nZ2xlICYmIG9mZkNsYXNzICkge1xuICAgICAgICByZXR1cm4gXCIgXCIrb2ZmQ2xhc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxud2luZG93LnRvZ2dsZUNsYXNzID0gdG9nZ2xlQ2xhc3M7XG5cbn0pKCk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvcGFnZXMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbiAoY29tcHMpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQ7XG5cbi8vVE9ETzogVGhpcyBpbmRlbnRhdGlvbiBpcyBhIG1lc3NcbmNsYXNzIEp1ZGdlQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgaWYgKCBwcm9wcy5oYWNrT3JkZXJpbmcubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSnVkZ2VBcHA6IEhhY2tvcmRlcmluZyBjYW5ub3QgYmUgZW1wdHkhXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGN1cnJlbnRIYWNrSWQ6IHByb3BzLmhhY2tPcmRlcmluZ1swXSxcbiAgICAgICAgICAgIGxpc3RWaWV3QWN0aXZlOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRIYWNrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5oYWNrc1t0aGlzLnN0YXRlLmN1cnJlbnRIYWNrSWRdO1xuICAgIH1cblxuICAgIGdldE5leHRIYWNrSWQoKSB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLnByb3BzLmhhY2tQb3NpdGlvbnNbdGhpcy5zdGF0ZS5jdXJyZW50SGFja0lkXTtcbiAgICAgICAgaWYgKCBwb3MrMSA+PSB0aGlzLnByb3BzLmhhY2tPcmRlcmluZy5sZW5ndGggKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLmhhY2tPcmRlcmluZ1twb3MrMV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQcmV2SGFja0lkKCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5wcm9wcy5oYWNrUG9zaXRpb25zW3RoaXMuc3RhdGUuY3VycmVudEhhY2tJZF07XG4gICAgICAgIGlmICggcG9zLTEgPCAwICkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5oYWNrT3JkZXJpbmdbcG9zLTFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBSZW5kZXJpbmdcblxuICAgIGdldFRvb2xiYXJQcm9wcygpIHtcbiAgICAgICAgbGV0IHByZXZIYWNrSWQgPSB0aGlzLmdldFByZXZIYWNrSWQoKTtcbiAgICAgICAgbGV0IG5leHRIYWNrSWQgPSB0aGlzLmdldE5leHRIYWNrSWQoKTtcblx0bGV0IHBvcyA9IHRoaXMucHJvcHMuaGFja1Bvc2l0aW9uc1t0aGlzLnN0YXRlLmN1cnJlbnRIYWNrSWRdO1xuXHRsZXQgbGFzdCA9IHBvcyA9PSB0aGlzLnByb3BzLmhhY2tPcmRlcmluZy5sZW5ndGgtMTtcblx0bGV0IGZpcnN0ID0gcG9zPT0wO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb25QcmV2OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZIYWNrSWQpIHRoaXMuc2V0U3RhdGUoe2N1cnJlbnRIYWNrSWQ6IHByZXZIYWNrSWR9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkxpc3Q6ICgpID0+IHtcblx0XHR0aGlzLnNldFN0YXRlKHtsaXN0Vmlld0FjdGl2ZTogIXRoaXMuc3RhdGUubGlzdFZpZXdBY3RpdmV9KVxuXHQgICAgfSxcbiAgICAgICAgICAgIG9uTmV4dDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChuZXh0SGFja0lkKSB0aGlzLnNldFN0YXRlKHtjdXJyZW50SGFja0lkOiBuZXh0SGFja0lkfSk7XG4gICAgICAgICAgICB9LFxuXHQgICAgbGFzdCxcblx0ICAgIGZpcnN0XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0SnVkZ2VQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuanVkZ2VJbmZvO1xuICAgIH1cblxuICAgIGdldFByb2plY3RQcm9wcygpIHtcblx0bGV0IHJhdGVkID0gdGhpcy5wcm9wcy5yYXRpbmdzW3RoaXMuc3RhdGUuY3VycmVudEhhY2tJZF0hPT0wO1xuICAgICAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHtyYXRlZH0sdGhpcy5nZXRDdXJyZW50SGFjaygpKTtcblx0cmV0dXJuIHByb3BzO1xuICAgIH1cblxuICAgIGdldFJhdGluZ0JveFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hvc2VuOiB0aGlzLnByb3BzLnJhdGluZ3NbdGhpcy5zdGF0ZS5jdXJyZW50SGFja0lkXSxcbiAgICAgICAgICAgIGhhY2tJZDogdGhpcy5zdGF0ZS5jdXJyZW50SGFja0lkLFxuICAgICAgICAgICAgb25TdWJtaXQ6IHIgPT4gc2xlZGdlLnNlbmRSYXRlSGFjayh7XG4gICAgICAgICAgICAgICAganVkZ2VJZDogdGhpcy5wcm9wcy5teUp1ZGdlSWQsXG4gICAgICAgICAgICAgICAgaGFja0lkOiB0aGlzLnN0YXRlLmN1cnJlbnRIYWNrSWQsXG4gICAgICAgICAgICAgICAgcmF0aW5nOiByXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRTdXBlcmxhdGl2ZVByb3BzKCkge1xuICAgICAgICBsZXQgc3VwZXJzID0gdGhpcy5wcm9wcy5zdXBlcmxhdGl2ZXMubWFwKCBzID0+ICh7XG4gICAgICAgICAgICBuYW1lOiBzLm5hbWUsXG4gICAgICAgICAgICBpZDogcy5pZCxcbiAgICAgICAgICAgIGNob3NlbkZpcnN0SWQ6IHRoaXMucHJvcHMuY2hvc2VuU3VwZXJsYXRpdmVzW3MuaWRdLmZpcnN0LFxuICAgICAgICAgICAgY2hvc2VuU2Vjb25kSWQ6IHRoaXMucHJvcHMuY2hvc2VuU3VwZXJsYXRpdmVzW3MuaWRdLnNlY29uZFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1cGVybGF0aXZlczogc3VwZXJzLFxuICAgICAgICAgICAgaGFja3M6IHRoaXMucHJvcHMuaGFja3MsXG4gICAgICAgICAgICBjdXJyZW50SGFja0lkOiB0aGlzLnN0YXRlLmN1cnJlbnRIYWNrSWQsXG4gICAgICAgICAgICBvblN1Ym1pdDogKHN1cGVySWQsIGNob2ljZXMpID0+IHtcbiAgICAgICAgICAgICAgICBzbGVkZ2Uuc2VuZFJhbmtTdXBlcmxhdGl2ZSh7XG4gICAgICAgICAgICAgICAgICAgIGp1ZGdlSWQ6IHRoaXMucHJvcHMubXlKdWRnZUlkLFxuICAgICAgICAgICAgICAgICAgICBzdXBlcmxhdGl2ZUlkOiBzdXBlcklkLFxuICAgICAgICAgICAgICAgICAgICBmaXJzdENob2ljZUlkOiBjaG9pY2VzLmZpcnN0LFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRDaG9pY2VJZDogY2hvaWNlcy5zZWNvbmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRQcm9qZWN0TGlzdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGFja3M6IHRoaXMucHJvcHMuaGFja3MsXG5cdCAgICByYXRpbmdzOiB0aGlzLnByb3BzLnJhdGluZ3MsXG4gICAgICAgICAgICBoYWNrT3JkZXJpbmc6IHRoaXMucHJvcHMuaGFja09yZGVyaW5nLFxuICAgICAgICAgICAgc2V0SGFja0lkOiBoaWQgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXJyZW50SGFja0lkOiBoaWQsIGxpc3RWaWV3QWN0aXZlOiBmYWxzZX0pXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY3VycmVudEhhY2sgPSB0aGlzLmdldEN1cnJlbnRIYWNrKCk7XG5cdGlmICggdGhpcy5zdGF0ZS5saXN0Vmlld0FjdGl2ZSApIHtcblx0ICAgIHJldHVybiBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImNvbnRhaW5lciBkLWZsZXgganVkZ2UtY29udGFpbmVyXCIgfSxcbiAgICAgICAgICAgICAgICBlKGNvbXBzLlRvb2xiYXIsIHRoaXMuZ2V0VG9vbGJhclByb3BzKCkpLFxuICAgICAgICAgICAgICAgIGUoY29tcHMuSnVkZ2VJbmZvLCB0aGlzLmdldEp1ZGdlUHJvcHMoKSksXG4gICAgICAgICAgICAgICAgZShjb21wcy5Qcm9qZWN0TGlzdCwgdGhpcy5nZXRQcm9qZWN0TGlzdFByb3BzKCkpXG5cdCAgICApO1xuXHR9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGUoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiY29udGFpbmVyIGQtZmxleCBqdWRnZS1jb250YWluZXJcIiB9LFxuICAgICAgICAgICAgICAgIGUoY29tcHMuVG9vbGJhciwgdGhpcy5nZXRUb29sYmFyUHJvcHMoKSksXG4gICAgICAgICAgICAgICAgZShjb21wcy5KdWRnZUluZm8sIHRoaXMuZ2V0SnVkZ2VQcm9wcygpKSxcbiAgICAgICAgICAgICAgICBlKGNvbXBzLlByb2plY3QsIHRoaXMuZ2V0UHJvamVjdFByb3BzKCkpLFxuICAgICAgICAgICAgICAgIGUoY29tcHMuUmF0aW5nQm94LCB0aGlzLmdldFJhdGluZ0JveFByb3BzKCkpLFxuICAgICAgICAgICAgICAgIGUoY29tcHMuU3VwZXJsYXRpdmVzLCB0aGlzLmdldFN1cGVybGF0aXZlUHJvcHMoKSlcbiAgICAgICAgICAgICk7XG5cdH1cbiAgICB9XG5cbn1cbmNvbXBzLkp1ZGdlQXBwID0gSnVkZ2VBcHA7XG5cbn0pKHdpbmRvdy5jb21wcyB8fCAod2luZG93LmNvbXBzID0ge30pKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NsaWVudC9jb21wb25lbnRzL2p1ZGdlYXBwLmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKGNvbXBzKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGUgPSBSZWFjdC5jcmVhdGVFbGVtZW50O1xuXG5jbGFzcyBKdWRnZUluZm8gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIGUoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwianVkZ2VpbmZvLWNvbXBcIiB9LFxuICAgICAgICAgICAgZShcInNwYW5cIiwgbnVsbCxcbiAgICAgICAgICAgICAgICBlKFwic3BhblwiLCBudWxsLCBcIkhlbGxvLCBcIiksXG4gICAgICAgICAgICAgICAgZShcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwianVkZ2VpbmZvLW5hbWVcIiB9LCB0aGlzLnByb3BzLm5hbWUpLFxuICAgICAgICAgICAgICAgIGUoXCJzcGFuXCIsIG51bGwsIFwiIVwiKSApXG4gICAgICAgICk7XG4gICAgfVxufVxuY29tcHMuSnVkZ2VJbmZvID0gSnVkZ2VJbmZvO1xuXG59KSh3aW5kb3cuY29tcHMgfHwgKHdpbmRvdy5jb21wcyA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvY29tcG9uZW50cy9qdWRnZWluZm8uanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbiAoY29tcHMpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQ7XG5cbmNsYXNzIFByb2plY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGdldE5hbWVBbmRMb2NhdGlvbigpIHtcbiAgICAgICAgbGV0IG5hbWVBbmRMb2NhdGlvbiA9IHRoaXMucHJvcHMubmFtZSArIFwiIChUYWJsZSBcIit0aGlzLnByb3BzLmxvY2F0aW9uK1wiKVwiO1xuXHRpZih0aGlzLnByb3BzLnJhdGVkKXtcblx0ICAgIG5hbWVBbmRMb2NhdGlvbiArPSBcIiBpcyByYXRlZFwiO1xuXHR9XG5cdHJldHVybiBuYW1lQW5kTG9jYXRpb247XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwcm9qZWN0LWNvbXBcIiB9LFxuICAgICAgICAgICAgZShcImgyXCIsIHsgY2xhc3NOYW1lOiBcInByb2plY3QtdGl0bGVcIiB9LFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0TmFtZUFuZExvY2F0aW9uKCkgKSxcbiAgICAgICAgICAgIGUoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInByb2plY3QtZGVzY3JpcHRpb25cIiB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZGVzY3JpcHRpb24gKVxuICAgICAgICApO1xuICAgIH1cbn1cbmNvbXBzLlByb2plY3QgPSBQcm9qZWN0O1xuXG59KSh3aW5kb3cuY29tcHMgfHwgKHdpbmRvdy5jb21wcyA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvY29tcG9uZW50cy9wcm9qZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKGNvbXBzKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGUgPSBSZWFjdC5jcmVhdGVFbGVtZW50O1xuXG5jbGFzcyBQcm9qZWN0TGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY3JlYXRlTGlzdEl0ZW0oaGFjaykge1xuXHRyZXR1cm4gZShQcm9qZWN0TGlzdEVsZW1lbnQsIHtcblx0ICAgIHByb2plY3ROYW1lOiBoYWNrLm5hbWUsXG5cdCAgICByYXRlZDogdGhpcy5wcm9wcy5yYXRpbmdzW2hhY2suaWRdICE9PSAwLFxuXHQgICAgdXBkYXRlSGFja0lkOiAoKSA9PiB0aGlzLnByb3BzLnNldEhhY2tJZChoYWNrLmlkKVxuXHR9KTtcbiAgICB9XG4gICAgcmVuZGVyKCl7XG5cdHZhciBlbGVtZW50cz10aGlzLnByb3BzLmhhY2tPcmRlcmluZy5tYXAoIGhpZCA9PlxuICAgICAgICB0aGlzLmNyZWF0ZUxpc3RJdGVtKHRoaXMucHJvcHMuaGFja3NbaGlkXSkgKVxuXHRyZXR1cm4gZShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImxpc3Qtdmlld1wifSxcblx0ICAgIGUoXCJ1bFwiLCBudWxsLFxuXHQgICAgICAgIC4uLmVsZW1lbnRzKSk7XG4gICAgfVxufVxuY29tcHMuUHJvamVjdExpc3QgPSBQcm9qZWN0TGlzdDtcblxuY2xhc3MgUHJvamVjdExpc3RFbGVtZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICByZW5kZXIoKXtcblx0bGV0IGNsYXNzTmFtZT1cImxpc3QtaXRlbSBidG4tcHJpbWFyeVwiO1xuXHRpZih0aGlzLnByb3BzLnJhdGVkKXtcblx0ICAgIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBidG4tc3VjY2Vzc1wiXG5cdH1cblx0cmV0dXJuIGUoXCJsaVwiLCB7XG5cdCAgICBjbGFzc05hbWUsXG5cdCAgICBvbkNsaWNrOiB0aGlzLnByb3BzLnVwZGF0ZUhhY2tJZFxuXHQgICAgfSxcblx0ICAgIHRoaXMucHJvcHMucHJvamVjdE5hbWVcblx0KTtcbiAgICB9XG59XG5jb21wcy5Qcm9qZWN0TGlzdEVsZW1lbnQgPSBQcm9qZWN0TGlzdEVsZW1lbnQ7XG5cbn0pKHdpbmRvdy5jb21wcyB8fCAod2luZG93LmNvbXBzID0ge30pKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NsaWVudC9jb21wb25lbnRzL3Byb2plY3RsaXN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKGNvbXBzKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGUgPSBSZWFjdC5jcmVhdGVFbGVtZW50O1xuXG5jbGFzcyBSYXRpbmdCb3ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gVE9ETzogVGhlc2Ugc2hvdWxkIHByb2JhYmx5IGJlIGxvYWRlZCBmcm9tIHNvbWV3aGVyZVxuICAgICAgICAgICAgY2F0ZWdvcmllczogW3tcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkVncmVnaW91c25lc3NcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogLTEsXG4gICAgICAgICAgICAgICAgZGlydHk6IHRydWUsXG4gICAgICAgICAgICAgICAgaWQ6IDBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkhvbWVsaW5lc3NcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogLTEsXG4gICAgICAgICAgICAgICAgZGlydHk6IHRydWUsXG4gICAgICAgICAgICAgICAgaWQ6IDFcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkFiaG9yZW50bmVzc1wiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiAtMSxcbiAgICAgICAgICAgICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpZDogMlxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiSW5vcGVyYXRpdmVuZXNzXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IC0xLFxuICAgICAgICAgICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGlkOiAzXG4gICAgICAgICAgICB9XSxcblxuICAgICAgICAgICAgbm9zaG93OiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgLy8gVE9ETzogSXMgdGhlcmUgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXM/IE1heWJlIHdlIHNob3VsZG4ndFxuICAgICAgICAvLyAgICAgICBiZSBzbyByZWxpYW50IG9uIHN0YXRlZnVsIGNvbXBvbmVudHM/XG4gICAgICAgIGlmICggdGhpcy5wcm9wcy5oYWNrSWQgIT09IG5ld1Byb3BzLmhhY2tJZCApIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKCAocHJldlN0YXRlLCBwcm9wcykgPT4ge1xuICAgICAgICAgICAgbGV0IGNhdHMgPSBwcmV2U3RhdGUuY2F0ZWdvcmllcy5zbGljZSgwKTtcbiAgICAgICAgICAgIGZvciAobGV0IGNhdCBvZiBjYXRzKSB7XG4gICAgICAgICAgICAgICAgY2F0LmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjYXQuc2VsZWN0ZWQgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IGNhdGVnb3JpZXM6IGNhdHMgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZWN0KGNhdElkLCBzY29yZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKCAocHJldlN0YXRlLCBwcm9wcykgPT4ge1xuICAgICAgICAgICAgbGV0IGNhdHMgPSBwcmV2U3RhdGUuY2F0ZWdvcmllcy5zbGljZSgwKTtcbiAgICAgICAgICAgIGNhdHNbY2F0SWRdLnNlbGVjdGVkID0gc2NvcmU7XG4gICAgICAgICAgICBjYXRzW2NhdElkXS5kaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4geyBjYXRlZ29yaWVzOiBjYXRzIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN1Ym1pdCgpIHtcbiAgICAgICAgbGV0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZCgpO1xuICAgICAgICBpZiAoIXNlbGVjdGVkLnZhbGlkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSggKHByZXZTdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgIGxldCBjYXRzID0gcHJldlN0YXRlLmNhdGVnb3JpZXMuc2xpY2UoMCk7XG4gICAgICAgICAgICBmb3IgKGxldCBjYXQgb2YgY2F0cykge1xuICAgICAgICAgICAgICAgIGNhdC5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgY2F0ZWdvcmllczogY2F0cyB9O1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnByb3BzLm9uU3VibWl0KHNlbGVjdGVkLnRvdGFsKTtcbiAgICB9XG5cbiAgICBnZXRTZWxlY3RlZCgpIHtcbiAgICAgICAgbGV0IHRvdGFsID0gMDtcbiAgICAgICAgbGV0IHZhbGlkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoIHRoaXMuc3RhdGUubm9zaG93ICkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b3RhbDogLTEsXG4gICAgICAgICAgICAgICAgdmFsaWQ6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBjYXQgb2YgdGhpcy5zdGF0ZS5jYXRlZ29yaWVzKSB7XG4gICAgICAgICAgICBpZiAoIGNhdC5zZWxlY3RlZCA+PSAwICkge1xuICAgICAgICAgICAgICAgIHRvdGFsICs9IGNhdC5zZWxlY3RlZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdG90YWwgPD0gMCB8fCAyMCA8IHRvdGFsIClcbiAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHsgdG90YWwsIHZhbGlkIH07XG4gICAgfVxuXG4gICAgcmVuZGVyQ2F0ZWdvcnkoY2F0KSB7XG4gICAgICAgIGxldCBidXR0b25zID0gW107XG4gICAgICAgIGZvciAobGV0IGk9MDtpPDY7aSsrKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWRDbGFzcyA9IGk9PWNhdC5zZWxlY3RlZD9cIiByYXRpbmdib3gtc2VsZWN0ZWRcIjpcIlwiO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKFxuICAgICAgICAgICAgICAgIGUoXCJidXR0b25cIiwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5XCIrc2VsZWN0ZWRDbGFzcyxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogKCkgPT4gdGhpcy5zZWxlY3QoY2F0LmlkLCBpKVxuICAgICAgICAgICAgICAgIH0sIGkudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGlydHlDbGFzcyA9IGNhdC5kaXJ0eT9cIiByYXRpbmdib3gtZGlydHlcIjpcIlwiO1xuICAgICAgICByZXR1cm4gZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyYXRpbmdib3gtY2F0ZWdvcnlcIiB9LFxuICAgICAgICAgICAgZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyYXRpbmdib3gtY2F0bmFtZVwiIH0sXG4gICAgICAgICAgICAgICAgZShcImgzXCIsIG51bGwsIGNhdC5uYW1lKSksXG4gICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJ0bi1ncm91cFwiK2RpcnR5Q2xhc3MgfSxcbiAgICAgICAgICAgICAgICAuLi5idXR0b25zKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlclNlbGVjdGVkKCkge1xuICAgICAgICBsZXQgc2VsZWN0ZWQgPSB0aGlzLmdldFNlbGVjdGVkKCk7XG4gICAgICAgIGxldCB2YWxpZENsYXNzID0gdG9nZ2xlQ2xhc3Moc2VsZWN0ZWQudmFsaWQsXG4gICAgICAgICAgICAgICAgXCJyYXRpbmdib3gtdmFsaWRcIiwgXCJyYXRpbmdib3gtaW52YWxpZFwiKTtcblxuICAgICAgICByZXR1cm4gZShcInNwYW5cIiwge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiB2YWxpZENsYXNzXG4gICAgICAgIH0sIHNlbGVjdGVkLnRvdGFsID49IDAgPyBcIlNlbGVjdGVkOiBcIiArIHNlbGVjdGVkLnRvdGFsLnRvU3RyaW5nKCkgOiBcIm5vIHNob3dcIik7XG4gICAgfVxuXG4gICAgcmVuZGVyQ2hvc2VuKCkge1xuICAgICAgICBsZXQgdG90YWwgPSB0aGlzLnByb3BzLmNob3NlbjtcblxuICAgICAgICBsZXQgdG90YWxTdHJpbmc7XG4gICAgICAgIGlmICggdG90YWwgPiAwICkge1xuICAgICAgICAgICAgdG90YWxTdHJpbmcgPSBcIkN1cnJlbnQ6IFwiICsgdG90YWwudG9TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICggdG90YWwgPCAwICkge1xuICAgICAgICAgICAgdG90YWxTdHJpbmcgPSBcIm5vIHNob3dcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvdGFsU3RyaW5nID0gXCJ1bnJhdGVkXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZShcInNwYW5cIiwgbnVsbCwgdG90YWxTdHJpbmcpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGNhdHMgPSBbXTtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm5vc2hvdylcbiAgICAgICAgICAgIGNhdHMgPSB0aGlzLnN0YXRlLmNhdGVnb3JpZXMubWFwKCBjID0+IHRoaXMucmVuZGVyQ2F0ZWdvcnkoYykgKTtcblxuICAgICAgICByZXR1cm4gZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyYXRpbmdib3gtY29tcFwiIH0sXG4gICAgICAgICAgICBlKFwiZGl2XCIsIG51bGwsXG4gICAgICAgICAgICAgICAgZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyYXRpbmdib3gtbm9zaG93XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgZShcImJ1dHRvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB0aGlzLnNldFN0YXRlKCAocHJldlN0YXRlLCBwcm9wcykgPT4gKHsgbm9zaG93OiAhcHJldlN0YXRlLm5vc2hvdyB9KSApXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMuc3RhdGUubm9zaG93P1wiTWFyayBIYWNrIGFzIFByZXNlbnRcIjpcIk1hcmsgSGFjayBhcyBObyBTaG93XCIpKSxcbiAgICAgICAgICAgICAgICAuLi5jYXRzLFxuICAgICAgICAgICAgICAgIGUoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmF0aW5nYm94LXN1bW1hcnlcIiB9LFxuICAgICAgICAgICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJhdGluZ2JveC10b3RhbHNlbGVjdGVkXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGUoXCJzcGFuXCIsIG51bGwsIHRoaXMucmVuZGVyU2VsZWN0ZWQoKSkpLFxuICAgICAgICAgICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJhdGluZ2JveC10b3RhbGNob3NlblwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBlKFwic3BhblwiLCBudWxsLCB0aGlzLnJlbmRlckNob3NlbigpKSkpLFxuICAgICAgICAgICAgICAgIGUoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmF0aW5nYm94LXN1Ym1pdFwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGUoXCJidXR0b25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogKCkgPT4gdGhpcy5zdWJtaXQoKVxuICAgICAgICAgICAgICAgICAgICB9LCBcIlNVQk1JVFwiKSkpXG4gICAgICAgICk7XG4gICAgfVxufVxuY29tcHMuUmF0aW5nQm94ID0gUmF0aW5nQm94O1xuXG59KSh3aW5kb3cuY29tcHMgfHwgKHdpbmRvdy5jb21wcyA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvY29tcG9uZW50cy9yYXRpbmdib3guanNcbi8vIG1vZHVsZSBpZCA9IDE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbiAoY29tcHMpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQ7XG5cbmNsYXNzIFN1cGVybGF0aXZlcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogW11cbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGxldCBzIG9mIHByb3BzLnN1cGVybGF0aXZlcykge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFtzLmlkXSA9IHtcbiAgICAgICAgICAgICAgICBmaXJzdDogcy5jaG9zZW5GaXJzdElkLFxuICAgICAgICAgICAgICAgIHNlY29uZDogcy5jaG9zZW5TZWNvbmRJZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN1cGVybGF0aXZlc0xpc3QoKSB7XG4gICAgICAgIGxldCBzdXBlckVsZW1zID0gW107XG4gICAgICAgIGZvciAobGV0IHN1cGVybGF0aXZlIG9mIHRoaXMucHJvcHMuc3VwZXJsYXRpdmVzKSB7XG4gICAgICAgICAgICBzdXBlckVsZW1zLnB1c2goIHRoaXMuc3VwZXJsYXRpdmVWaWV3ZXIoc3VwZXJsYXRpdmUpICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZShcImRpdlwiLCBudWxsLCAuLi5zdXBlckVsZW1zKTtcbiAgICB9XG5cbiAgICBnZXRIYWNrTmFtZShkZWYsIGlkKSB7XG4gICAgICAgIGlmICggaWQgPCAxICkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLmhhY2tzW2lkXS5uYW1lO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0ZWRGaXJzdElkKHN1cGVybGF0aXZlSWQpIHtcbiAgICAgICAgaWYgKCB0aGlzLnN0YXRlLnNlbGVjdGVkW3N1cGVybGF0aXZlSWRdICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VsZWN0ZWRbc3VwZXJsYXRpdmVJZF0uZmlyc3Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFNlbGVjdGVkU2Vjb25kSWQoc3VwZXJsYXRpdmVJZCkge1xuICAgICAgICBpZiAoIHRoaXMuc3RhdGUuc2VsZWN0ZWRbc3VwZXJsYXRpdmVJZF0gKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5zZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5zZWNvbmQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXRTZWxlY3RlZChzZWxlY3RlZCwgc3VwZXJsYXRpdmVJZCkge1xuICAgICAgICBpZiAoIXNlbGVjdGVkW3N1cGVybGF0aXZlSWRdKSB7XG4gICAgICAgICAgICBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXSA9IHtcbiAgICAgICAgICAgICAgICBmaXJzdDogMCxcbiAgICAgICAgICAgICAgICBzZWNvbmQ6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3RGaXJzdChzdXBlcmxhdGl2ZUlkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoIChwcmV2U3RhdGUsIHByb3BzKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBwcmV2U3RhdGUuc2VsZWN0ZWQuc2xpY2UoMCk7XG4gICAgICAgICAgICB0aGlzLmluaXRTZWxlY3RlZChzZWxlY3RlZCwgc3VwZXJsYXRpdmVJZCk7XG5cbiAgICAgICAgICAgIGlmICggcHJvcHMuY3VycmVudEhhY2tJZCA9PT0gc2VsZWN0ZWRbc3VwZXJsYXRpdmVJZF0uc2Vjb25kICkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLnNlY29uZCA9IHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0O1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0ID0gcHJvcHMuY3VycmVudEhhY2tJZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHByb3BzLmN1cnJlbnRIYWNrSWQgIT09IHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0ICkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLnNlY29uZCA9IHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0O1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0ID0gcHJvcHMuY3VycmVudEhhY2tJZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHsgc2VsZWN0ZWQgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZWN0U2Vjb25kKHN1cGVybGF0aXZlSWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSggKHByZXZTdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZCA9IHByZXZTdGF0ZS5zZWxlY3RlZC5zbGljZSgwKTtcbiAgICAgICAgICAgIHRoaXMuaW5pdFNlbGVjdGVkKHNlbGVjdGVkLCBzdXBlcmxhdGl2ZUlkKTtcblxuICAgICAgICAgICAgaWYgKCBwcm9wcy5jdXJyZW50SGFja0lkID09PSBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5maXJzdCApIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5maXJzdCA9IHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLnNlY29uZDtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5zZWNvbmQgPSBwcm9wcy5jdXJyZW50SGFja0lkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5zZWNvbmQgPSBwcm9wcy5jdXJyZW50SGFja0lkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0ID09PSAwICkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0ID0gc2VsZWN0ZWRbc3VwZXJsYXRpdmVJZF0uc2Vjb25kO1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLnNlY29uZCA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7IHNlbGVjdGVkIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUZpcnN0KHN1cGVybGF0aXZlSWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSggKHByZXZTdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZCA9IHByZXZTdGF0ZS5zZWxlY3RlZC5zbGljZSgwKTtcbiAgICAgICAgICAgIHNlbGVjdGVkW3N1cGVybGF0aXZlSWRdLmZpcnN0ID0gc2VsZWN0ZWRbc3VwZXJsYXRpdmVJZF0uc2Vjb25kO1xuICAgICAgICAgICAgc2VsZWN0ZWRbc3VwZXJsYXRpdmVJZF0uc2Vjb25kID0gMDtcbiAgICAgICAgICAgIHJldHVybiB7IHNlbGVjdGVkIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZVNlY29uZChzdXBlcmxhdGl2ZUlkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoIChwcmV2U3RhdGUsIHByb3BzKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBwcmV2U3RhdGUuc2VsZWN0ZWQuc2xpY2UoMCk7XG4gICAgICAgICAgICBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5zZWNvbmQgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgc2VsZWN0ZWQgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV2ZXJ0KHN1cGVybGF0aXZlSWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSggKHByZXZTdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZCA9IHByZXZTdGF0ZS5zZWxlY3RlZC5zbGljZSgwKTtcbiAgICAgICAgICAgIGxldCBzdXBlcmxhdGl2ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHMgb2YgcHJvcHMuc3VwZXJsYXRpdmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBzLmlkID09PSBzdXBlcmxhdGl2ZUlkICkgc3VwZXJsYXRpdmUgPSBzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5maXJzdCA9IHN1cGVybGF0aXZlLmNob3NlbkZpcnN0SWQ7XG4gICAgICAgICAgICBzZWxlY3RlZFtzdXBlcmxhdGl2ZUlkXS5zZWNvbmQgPSBzdXBlcmxhdGl2ZS5jaG9zZW5TZWNvbmRJZDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3VibWl0KHN1cGVybGF0aXZlSWQpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblN1Ym1pdChzdXBlcmxhdGl2ZUlkLCB0aGlzLnN0YXRlLnNlbGVjdGVkW3N1cGVybGF0aXZlSWRdKTtcbiAgICB9XG5cbiAgICBzdXBlcmxhdGl2ZVZpZXdlcihzKSB7XG4gICAgICAgIGxldCBzZWxlY3RlZEZpcnN0SWQgPSB0aGlzLmdldFNlbGVjdGVkRmlyc3RJZChzLmlkKTtcbiAgICAgICAgbGV0IHNlbGVjdGVkU2Vjb25kSWQgPSB0aGlzLmdldFNlbGVjdGVkU2Vjb25kSWQocy5pZCk7XG5cbiAgICAgICAgbGV0IHNlbGVjdGVkRmlyc3ROYW1lID0gdGhpcy5nZXRIYWNrTmFtZShcIltOTyBGSVJTVCBQTEFDRV1cIiwgc2VsZWN0ZWRGaXJzdElkKTtcbiAgICAgICAgbGV0IHNlbGVjdGVkU2Vjb25kTmFtZSA9IHRoaXMuZ2V0SGFja05hbWUoXCJbTk8gU0VDT05EIFBMQUNFXVwiLCBzZWxlY3RlZFNlY29uZElkKTtcblxuICAgICAgICBsZXQgZGlydHlGaXJzdENsYXNzID0gKHNlbGVjdGVkRmlyc3RJZCA9PT0gcy5jaG9zZW5GaXJzdElkKT9cIlwiOlwiIHN1cGVybGF0aXZlcy1kaXJ0eVwiO1xuICAgICAgICBsZXQgZGlydHlTZWNvbmRDbGFzcyA9IChzZWxlY3RlZFNlY29uZElkID09PSBzLmNob3NlblNlY29uZElkKT9cIlwiOlwiIHN1cGVybGF0aXZlcy1kaXJ0eVwiO1xuXG4gICAgICAgIHJldHVybiBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImQtZmxleCBmbGV4LWNvbHVtbiBzdXBlcmxhdGl2ZXMtaXRlbVwiIH0sXG4gICAgICAgICAgICBlKFwiZGl2XCIsIG51bGwsXG4gICAgICAgICAgICAgICAgZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJkLWZsZXggZmxleC1yb3cgc3VwZXJsYXRpdmVzLWluZm9cIiB9LFxuICAgICAgICAgICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlcy1uYW1lXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGUoXCJoM1wiLCBudWxsLCBzLm5hbWUpKSxcbiAgICAgICAgICAgICAgICAgICAgZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzdXBlcmxhdGl2ZXMtY2hvc2VuXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGUoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZC1mbGV4IGZsZXgtY29sdW1uXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlcy1maXJzdFwiK2RpcnR5Rmlyc3RDbGFzcyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImQtZmxleCBmbGV4LXJvdyBqdXN0aWZ5LWNvbnRlbnQtZW5kXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlcy1oYWNrXCIgfSwgc2VsZWN0ZWRGaXJzdE5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZShcImJ1dHRvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlcy1yZW1vdmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB0aGlzLnJlbW92ZUZpcnN0KHMuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBcIlhcIikpKSxcblx0XHRcdCAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlcy1zZWNvbmRcIitkaXJ0eVNlY29uZENsYXNzIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZC1mbGV4IGZsZXgtcm93IGp1c3RpZnktY29udGVudC1lbmRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZShcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic3VwZXJsYXRpdmVzLWhhY2tcIiB9LCBzZWxlY3RlZFNlY29uZE5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZShcImJ1dHRvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlLXJlbW92ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHRoaXMucmVtb3ZlU2Vjb25kKHMuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBcIlhcIikpKSkpKSksXG4gICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlcy1hY3Rpb25zXCIgfSxcblx0ICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJvd1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIGUoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYnRuLWdyb3VwIGNvbC1tZC02IGJ0bi1ncm91cC1qdXN0aWZpZWRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZShcImJ1dHRvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeSBzdXBlcmxhdGl2ZXMtYnRuLWZpcnN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogKCkgPT4gdGhpcy5zZWxlY3RGaXJzdChzLmlkKVxuXHRcdFx0fSwgXCJGSVJTVFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGUoXCJidXR0b25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnkgc3VwZXJsYXRpdmVzLWJ0bi1zZWNvbmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB0aGlzLnNlbGVjdFNlY29uZChzLmlkKVxuXHRcdFx0fSwgXCJTRUNPTkRcIikpLFxuXHQgICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJ0bi1ncm91cCBjb2wtbWQtNiBidG4tZ3JvdXAtanVzdGlmaWVkXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGUoXCJidXR0b25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnkgc3VwZXJsYXRpdmVzLWJ0bi1yZXZlcnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB0aGlzLnJldmVydChzLmlkKVxuXHRcdFx0fSwgXCJSRVZFUlRcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBlKFwiYnV0dG9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IHN1cGVybGF0aXZlcy1idG4tc3VibWl0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogKCkgPT4gdGhpcy5zdWJtaXQocy5pZClcblx0XHRcdH0sIFwiU1VCTUlUXCIpKSkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzdXBlcmxhdGl2ZXMtY29tcFwiIH0sXG4gICAgICAgICAgICBlKFwiaDJcIiwgbnVsbCwgXCJTdXBlcmxhdGl2ZXNcIiksXG4gICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN1cGVybGF0aXZlcy1saXN0XCIgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnN1cGVybGF0aXZlc0xpc3QoKSApXG4gICAgICAgICk7XG4gICAgfVxufVxuY29tcHMuU3VwZXJsYXRpdmVzID0gU3VwZXJsYXRpdmVzO1xuXG59KSh3aW5kb3cuY29tcHMgfHwgKHdpbmRvdy5jb21wcyA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvY29tcG9uZW50cy9zdXBlcmxhdGl2ZXMuanNcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbiAoY29tcHMpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQ7XG5cbmNsYXNzIFRvb2xiYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGJ1dHRvbkNsYXNzTmFtZShkaXNhYmxlKSB7XG5cdGlmIChkaXNhYmxlKSB7XG5cdCAgICByZXR1cm4gIFwiYnRuIGJ0bi1wcmltYXJ5IHRvb2xiYXItcHJldiBkaXNhYmxlZCB0b29sYmFyLW5vLXRleHRcIlxuXHR9IGVsc2Uge1xuXHQgICAgcmV0dXJuIFwiYnRuIGJ0bi1wcmltYXJ5IHRvb2xiYXItcHJldlwiXG5cdH1cbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0b29sYmFyLWNvbXBcIiB9LFxuICAgICAgICAgICAgZShcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0b29sYmFyLXRpdGxlXCIgfSxcbiAgICAgICAgICAgICAgICBlKFwiaDFcIiwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJTTEVER0VcIiApICksXG4gICAgICAgICAgICBlKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJ0bi1ncm91cCB0b29sYmFyLWJ1dHRvbnNcIn0sXG4gICAgICAgICAgICAgICAgZShcImJ1dHRvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5idXR0b25DbGFzc05hbWUodGhpcy5wcm9wcy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMub25QcmV2XG4gICAgICAgICAgICAgICAgfSwgXCI8LS1cIiksXG4gICAgICAgICAgICAgICAgZShcImJ1dHRvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnkgdG9vbGJhci1saXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMub25MaXN0XG4gICAgICAgICAgICAgICAgfSwgXCJMSVNUXCIpLFxuICAgICAgICAgICAgICAgIGUoXCJidXR0b25cIiwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHRoaXMuYnV0dG9uQ2xhc3NOYW1lKHRoaXMucHJvcHMubGFzdCksXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMub25OZXh0XG4gICAgICAgICAgICAgICAgfSwgXCItLT5cIikgKVxuICAgICAgICApO1xuICAgIH1cbn1cbmNvbXBzLlRvb2xiYXIgPSBUb29sYmFyO1xuXG59KSh3aW5kb3cuY29tcHMgfHwgKHdpbmRvdy5jb21wcyA9IHt9KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvY29tcG9uZW50cy90b29sYmFyLmpzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Nhc3MtbG9hZGVyL2xpYi9sb2FkZXIuanMhLi9nbG9iYWwuc2Nzc1wiKTtcblxuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG5cbnZhciB0cmFuc2Zvcm07XG52YXIgaW5zZXJ0SW50bztcblxuXG5cbnZhciBvcHRpb25zID0ge1wiaG1yXCI6dHJ1ZX1cblxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbm9wdGlvbnMuaW5zZXJ0SW50byA9IHVuZGVmaW5lZDtcblxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2FscztcblxuaWYobW9kdWxlLmhvdCkge1xuXHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Nhc3MtbG9hZGVyL2xpYi9sb2FkZXIuanMhLi9nbG9iYWwuc2Nzc1wiLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9saWIvbG9hZGVyLmpzIS4vZ2xvYmFsLnNjc3NcIik7XG5cblx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblxuXHRcdHZhciBsb2NhbHMgPSAoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0dmFyIGtleSwgaWR4ID0gMDtcblxuXHRcdFx0Zm9yKGtleSBpbiBhKSB7XG5cdFx0XHRcdGlmKCFiIHx8IGFba2V5XSAhPT0gYltrZXldKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlkeCsrO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3Ioa2V5IGluIGIpIGlkeC0tO1xuXG5cdFx0XHRyZXR1cm4gaWR4ID09PSAwO1xuXHRcdH0oY29udGVudC5sb2NhbHMsIG5ld0NvbnRlbnQubG9jYWxzKSk7XG5cblx0XHRpZighbG9jYWxzKSB0aHJvdyBuZXcgRXJyb3IoJ0Fib3J0aW5nIENTUyBITVIgZHVlIHRvIGNoYW5nZWQgY3NzLW1vZHVsZXMgbG9jYWxzLicpO1xuXG5cdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHR9KTtcblxuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jbGllbnQvZ2xvYmFsLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDE4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiQGltcG9ydCB1cmwoaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3M/ZmFtaWx5PU1yK0RhZm9lKTtcIiwgXCJcIl0pO1xuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiQGltcG9ydCB1cmwoaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3M/ZmFtaWx5PVRpdGlsbGl1bStXZWI6OTAwKTtcIiwgXCJcIl0pO1xuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiQGltcG9ydCB1cmwoaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3M/ZmFtaWx5PVJpZ2h0ZW91cyk7XCIsIFwiXCJdKTtcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1DYW5kYWwpO1wiLCBcIlwiXSk7XG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCJAaW1wb3J0IHVybChodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2Nzcz9mYW1pbHk9UGVybWFuZW50K01hcmtlcik7XCIsIFwiXCJdKTtcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1Nb25vdG9uKTtcIiwgXCJcIl0pO1xuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIiNhZG1pblBhZ2UgI2xvZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogNTAwcHg7XFxuICBmb250LWZhbWlseTogXFxcIkx1Y2lkYSBDb25zb2xlXFxcIiwgTW9uYWNvLCBtb25vc3BhY2U7IH1cXG5cXG4jYWRtaW5QYWdlICNjbWQge1xcbiAgd2lkdGg6IDEwMCU7IH1cXG5cXG4jbG9naW5Gb3JtIHtcXG4gIG1hcmdpbjogMTBweDtcXG4gIGNvbG9yOiB3aGl0ZTsgfVxcblxcbi5sb2dpbi1jb250YWluZXIge1xcbiAgYm9yZGVyOiBzb2xpZCA1cHg7XFxuICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICBib3JkZXItY29sb3I6IGJsYWNrO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzE5QzBFNztcXG4gIHBhZGRpbmc6IDE1cHg7IH1cXG5cXG5ib2R5IHtcXG4gIG1hcmdpbjogMzVweDsgfVxcblxcbiNsb2dpbkZvcm0gYnV0dG9uIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgcGFkZGluZzogMTBweDtcXG4gIG1hcmdpbjogMTBweCAwcHg7IH1cXG5cXG4uaGlkZGVuIHtcXG4gIGRpc3BsYXk6IG5vbmU7IH1cXG5cXG4uc2xlZGdlLXByaW1hcnkge1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzgwOTM1ZTsgfVxcblxcbi5zbGVkZ2Utc2Vjb25kYXJ5IHtcXG4gIGNvbG9yOiAjODA5MzVlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2RiZDliMTsgfVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ2OHB4KSB7XFxuICAuc3RhcnQge1xcbiAgICBkaXNwbGF5OiBub25lOyB9IH1cXG5cXG4jbWVzc2FnZSB7XFxuICBjb2xvcjogd2hpdGU7XFxuICB0ZXh0LXNoYWRvdzogMC41cHggMC41cHggIzAwMDAwMDsgfVxcblxcbi8qKioqKioqKioqKioqKioqKioqKlxcbiAqIE92ZXJhbGxcXG4gKi9cXG4uanVkZ2UtY29udGFpbmVyIHtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBib3JkZXI6IHNvbGlkIDVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gIGJvcmRlci1jb2xvcjogYmxhY2s7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMTlDMEU3O1xcbiAgY29sb3I6IHdoaXRlOyB9XFxuXFxuLyoqKioqKioqKioqKioqKioqKioqXFxuICogQ29sb3JzXFxuICovXFxuLnNsZWRnZS1wcmltYXJ5IHtcXG4gIGJvcmRlci1jb2xvcjogIzgwOTM1ZTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM4MDkzNWU7IH1cXG5cXG4uc2xlZGdlLXNlY29uZGFyeSB7XFxuICBib3JkZXItY29sb3I6ICNkYmQ5YjE7XFxuICBjb2xvcjogIzgwOTM1ZTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNkYmQ5YjE7IH1cXG5cXG4vKlxcbi5zbGVkZ2Utc2Vjb25kYXJ5OmhvdmVyIHtcXG4gICAgYm9yZGVyLWNvbG9yOiAjZGJkOWIxO1xcbiAgICBjb2xvcjogIzgwOTM1ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2RiZDliMTtcXG59Ki9cXG4vKioqKioqKioqKioqKioqKioqKipcXG4gKiBNZWRpYSBRdWVyeSBNaXNjXFxuICovXFxuLyogVE9ETzogV2UncmUgZmlnaHRpbmcgQm9vdHN0cmFwIHdpdGggdGhlc2UgJ2ltcG9ydGFudCcgdGFncyxcXG4gKiAgICAgICBtYXliZSBpdCB3b3VsZCBiZSBiZXR0ZXIgdG8gbm90IHVzZSBCb290c3RyYXAgY2xhc3Nlc1xcbiAqICAgICAgIHRhZ2dlZCB3LyBpbXBvcnRhbnQuXFxuICovXFxuQG1lZGlhIChtYXgtd2lkdGg6IDQyMHB4KSB7XFxuICAudG9vbGJhci10aXRsZSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7IH1cXG4gIC50b29sYmFyLWJ1dHRvbnMge1xcbiAgICB3aWR0aDogMTAwJTsgfVxcbiAgLnN1cGVybGF0aXZlcy1pbmZvIHtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbiAhaW1wb3J0YW50OyB9XFxuICAuc3VwZXJsYXRpdmVzLWZpcnN0IGRpdiwgLnN1cGVybGF0aXZlcy1zZWNvbmQgZGl2IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuICFpbXBvcnRhbnQ7IH1cXG4gIC5zdXBlcmxhdGl2ZXMtY2hvc2VuIHtcXG4gICAgd2lkdGg6IDEwMCU7IH0gfVxcblxcbi8qXFxuICogcmF0aW5nYm94LmNzc1xcbiAqL1xcbi5yYXRpbmdib3gtY29tcCBidXR0b24ge1xcbiAgaGVpZ2h0OiA4MHB4O1xcbiAgY3Vyc29yOiBwb2ludGVyOyB9XFxuXFxuLnJhdGluZ2JveC1ub3Nob3cge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyOyB9XFxuXFxuLnJhdGluZ2JveC1ub3Nob3cgYnV0dG9uIHtcXG4gIHdpZHRoOiAxODAgcHg7IH1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA0MDBweCkge1xcbiAgLnJhdGluZ2JveC1ub3Nob3cgYnV0dG9uIHtcXG4gICAgd2lkdGg6IDYwJTsgfSB9XFxuXFxuLnJhdGluZ2JveC1jYXRuYW1lIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgZm9udC1zaXplOiAzMHB4O1xcbiAgY29sb3I6IHdoaXRlOyB9XFxuXFxuLnJhdGluZ2JveC1jb21wIC5idG4tZ3JvdXAge1xcbiAgcGFkZGluZzogMTBweDtcXG4gIHdpZHRoOiAxMDAlOyB9XFxuXFxuLnJhdGluZ2JveC1jYXRlZ29yeSBidXR0b24ge1xcbiAgd2lkdGg6IDE2LjY2JTsgfVxcblxcbi5yYXRpbmdib3gtc2VsZWN0ZWQge1xcbiAgYmFja2dyb3VuZDogZ3JlZW47IH1cXG5cXG4ucmF0aW5nYm94LWRpcnR5IC5yYXRpbmdib3gtc2VsZWN0ZWQge1xcbiAgYmFja2dyb3VuZDogeWVsbG93OyB9XFxuXFxuLnJhdGluZ2JveC1zdW1tYXJ5IHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZm9udC1zaXplOiAyNXB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyOyB9XFxuXFxuLnJhdGluZ2JveC10b3RhbHNlbGVjdGVkIHtcXG4gIGZsb2F0OiBsZWZ0O1xcbiAgd2lkdGg6IDUwJTsgfVxcblxcbi5yYXRpbmdib3gtdG90YWxjaG9zZW4ge1xcbiAgZmxvYXQ6IHJpZ2h0O1xcbiAgd2lkdGg6IDUwJTsgfVxcblxcbi5yYXRpbmdib3gtdG90YWxzZWxlY3RlZCAucmF0aW5nYm94LWludmFsaWQge1xcbiAgY29sb3I6IHJlZDtcXG4gIHRleHQtc2hhZG93OiAxcHggMXB4ICMwMDAwMDA7IH1cXG5cXG4ucmF0aW5nYm94LXN1Ym1pdCBidXR0b24ge1xcbiAgd2lkdGg6IDEwMCU7IH1cXG5cXG4vKlxcbiAqIHRvb2xiYXIuY3NzXFxuICovXFxuLnRvb2xiYXItY29tcCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgd2lkdGg6IDEwMCU7XFxuICBwYWRkaW5nOiAyMHB4OyB9XFxuXFxuLnRvb2xiYXItdGl0bGUge1xcbiAgd2lkdGg6IDMwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIG1hcmdpbjogYXV0byBhdXRvOyB9XFxuXFxuLnRvb2xiYXItdGl0bGUgaDEge1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSBOZXVlLCBIZWx2ZXRpY2E7XFxuICBmb250LXNpemU6IDI0cHg7IH1cXG5cXG4udG9vbGJhci1idXR0b25zIGJ1dHRvbiB7XFxuICBjdXJzb3I6IHBvaW50ZXI7IH1cXG5cXG4udG9vbGJhci1uby10ZXh0IHtcXG4gIGNvbG9yOiAjMDA3YmZmOyB9XFxuXFxuLnRvb2xiYXItbm8tdGV4dDpob3ZlciB7XFxuICBjb2xvcjogIzAwN2JmZjsgfVxcblxcbi8qXFxuICoganVkZ2VpbmZvLmNzc1xcbiAqL1xcbi5qdWRnZWluZm8tY29tcCB7XFxuICBtYXJnaW46IDEwcHggYXV0bztcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgdGV4dC1zaGFkb3c6IDAuNXB4IDAuNXB4ICMwMDAwMDA7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXNpemU6IDQwcHg7IH1cXG5cXG4uanVkZ2VpbmZvLW5hbWUge1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICBjb2xvcjogd2hpdGU7XFxuICB0ZXh0LXNoYWRvdzogMC41cHggMC41cHggIzAwMDAwMDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogNDBweDsgfVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDQ2OHB4KSBhbmQgKG1heC13aWR0aDogNzY4cHgpIHtcXG4gIC5qdWRnZWluZm8tY29tcCB7XFxuICAgIGZvbnQtc2l6ZTogNTBweDsgfVxcbiAgLmp1ZGdlaW5mby1uYW1lIHtcXG4gICAgZm9udC1zaXplOiA1MHB4OyB9IH1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAyMDBweCkgYW5kIChtYXgtd2lkdGg6IDQ2N3B4KSB7XFxuICAuanVkZ2VpbmZvLWNvbXAge1xcbiAgICBmb250LXNpemU6IDI1cHg7IH1cXG4gIC5qdWRnZWluZm8tbmFtZSB7XFxuICAgIGZvbnQtc2l6ZTogMjVweDsgfSB9XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogMHB4KSBhbmQgKG1heC13aWR0aDogMTk5cHgpIHtcXG4gIC5qdWRnZWluZm8tY29tcCB7XFxuICAgIGZvbnQtc2l6ZTogMjVweDsgfVxcbiAgLmp1ZGdlaW5mby1uYW1lIHtcXG4gICAgZm9udC1zaXplOiAyNXB4OyB9IH1cXG5cXG4vKlxcbiAqIHByb2plY3RsaXN0LmNzc1xcbiAqL1xcbi5saXN0LXZpZXcge1xcbiAgbWFyZ2luOiAxNXB4OyB9XFxuXFxuLmxpc3QtdmlldyB1bCB7XFxuICBwYWRkaW5nOiAwO1xcbiAgbGlzdC1zdHlsZS10eXBlOiBub25lO1xcbiAgY29sb3I6IHdoaXRlOyB9XFxuXFxuLmxpc3QtaXRlbSB7XFxuICBtYXJnaW46IDBweCAwcHggNXB4IDBweDtcXG4gIGNvbG9yOiB3aGl0ZTsgfVxcblxcbi8qXFxuICogc3VwZXJsYXRpdmVzLmNzc1xcbiAqL1xcbi5zdXBlcmxhdGl2ZXMtY29tcCB7XFxuICBtYXJnaW46IDE1cHg7IH1cXG5cXG4uc3VwZXJsYXRpdmVzLWNvbXAgaDIge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgY29sb3I6ICNmZmZmZmY7IH1cXG5cXG4uc3VwZXJsYXRpdmVzLW5hbWUge1xcbiAgd2lkdGg6IDExMHB4O1xcbiAgY29sb3I6ICNmZmZmZmY7IH1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MjBweCkgYW5kIChtaW4tc2NyZWVuOiAwcHgpIHtcXG4gIC5zdXBlcmxhdGl2ZXMtbmFtZSB7XFxuICAgIGZvbnQtc2l6ZTogMzBweDsgfSB9XFxuXFxuLypAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOjQ4NHB4KXtcXG4gICAgd2lkdGg6IDM4JTtcXG59Ki9cXG4uc3VwZXJsYXRpdmVzLWNob3NlbiB7XFxuICB3aWR0aDogNjIlOyB9XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDI1cHgpIHtcXG4gIC5zdXBlcmxhdGl2ZXMtY2hvc2VuIHtcXG4gICAgd2lkdGg6IDM4JTsgfSB9XFxuXFxuLnN1cGVybGF0aXZlcy1pdGVtIHtcXG4gIG1hcmdpbjogMTVweCAxMHB4O1xcbiAgcGFkZGluZzogMTBweDtcXG4gIGJvcmRlci1sZWZ0OiAxMHB4IHNvbGlkICMwMDA7IH1cXG5cXG4uc3VwZXJsYXRpdmVzLWFjdGlvbnMge1xcbiAgd2lkdGg6IDEwMCU7IH1cXG5cXG4uc3VwZXJsYXRpdmVzLWRpcnR5IHtcXG4gIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcblxcbi5zdXBlcmxhdGl2ZXMtYWN0aW9ucyAuYnRuLWdyb3VwIHtcXG4gIHdpZHRoOiAxMDAlOyB9XFxuXFxuLnN1cGVybGF0aXZlcy1hY3Rpb25zIC5idG4ge1xcbiAgd2lkdGg6IDc5cHg7XFxuICBoZWlnaHQ6IDgwcHg7XFxuICBjdXJzb3I6IHBvaW50ZXI7IH1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA0ODRweCkge1xcbiAgLnN1cGVybGF0aXZlcy1hY3Rpb25zIC5idG4ge1xcbiAgICB3aWR0aDogNTAlOyB9IH1cXG5cXG4vKlxcbiAqIHByb2plY3QuY3NzXFxuICovXFxuLnByb2plY3QtY29tcCB7XFxuICBtYXJnaW46IDE1cHg7XFxuICBjb2xvcjogd2hpdGU7XFxuICB0ZXh0LXNoYWRvdzogMC41cHggMC41cHggIzAwMDAwMDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYwMHB4KSB7XFxuICAucHJvamVjdC10aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMjBweDsgfSB9XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjAwcHgpIHtcXG4gIC5wcm9qZWN0LXRpdGxlIHtcXG4gICAgZm9udC1zaXplOiAxOHB4OyB9IH1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MDBweCkge1xcbiAgLnByb2plY3QtdGl0bGUge1xcbiAgICBmb250LXNpemU6IDE2cHg7IH0gfVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDMzOXB4KSB7XFxuICAucHJvamVjdC10aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMTJweDsgfSB9XFxuXFxuLnByb2plY3QtZGVzY3JpcHRpb24ge1xcbiAgdGV4dC1pbmRlbnQ6IDEwcHg7XFxuICBjb2xvcjogd2hpdGU7IH1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA4MDBweCkge1xcbiAgLnByb2plY3QtdGl0bGUge1xcbiAgICBmb250LXNpemU6IDIwcHg7IH0gfVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvbGliL2xvYWRlci5qcyEuL3NyYy9jbGllbnQvZ2xvYmFsLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VTb3VyY2VNYXApIHtcblx0dmFyIGxpc3QgPSBbXTtcblxuXHQvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApO1xuXHRcdFx0aWYoaXRlbVsyXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJAbWVkaWEgXCIgKyBpdGVtWzJdICsgXCJ7XCIgKyBjb250ZW50ICsgXCJ9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdH1cblx0XHR9KS5qb2luKFwiXCIpO1xuXHR9O1xuXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cdGxpc3QuaSA9IGZ1bmN0aW9uKG1vZHVsZXMsIG1lZGlhUXVlcnkpIHtcblx0XHRpZih0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcblx0XHR2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXHRcdFx0aWYodHlwZW9mIGlkID09PSBcIm51bWJlclwiKVxuXHRcdFx0XHRhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG5cdFx0fVxuXHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gbW9kdWxlc1tpXTtcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcblx0XHRcdC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90IDEwMCUgcGVyZmVjdCBmb3Igd2VpcmQgbWVkaWEgcXVlcnkgY29tYmluYXRpb25zXG5cdFx0XHQvLyAgd2hlbiBhIG1vZHVsZSBpcyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIGRpZmZlcmVudCBtZWRpYSBxdWVyaWVzLlxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcblx0XHRcdGlmKHR5cGVvZiBpdGVtWzBdICE9PSBcIm51bWJlclwiIHx8ICFhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG5cdFx0XHRcdGlmKG1lZGlhUXVlcnkgJiYgIWl0ZW1bMl0pIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcblx0XHRcdFx0fSBlbHNlIGlmKG1lZGlhUXVlcnkpIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gXCIoXCIgKyBpdGVtWzJdICsgXCIpIGFuZCAoXCIgKyBtZWRpYVF1ZXJ5ICsgXCIpXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlzdC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5mdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgY29udGVudCA9IGl0ZW1bMV0gfHwgJyc7XG5cdHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblx0aWYgKCFjc3NNYXBwaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdH1cblxuXHRpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG5cdFx0dmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0XHRcdHJldHVybiAnLyojIHNvdXJjZVVSTD0nICsgY3NzTWFwcGluZy5zb3VyY2VSb290ICsgc291cmNlICsgJyAqLydcblx0XHR9KTtcblxuXHRcdHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuXHR9XG5cblx0cmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn1cblxuLy8gQWRhcHRlZCBmcm9tIGNvbnZlcnQtc291cmNlLW1hcCAoTUlUKVxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0dmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG5cdHZhciBkYXRhID0gJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCcgKyBiYXNlNjQ7XG5cblx0cmV0dXJuICcvKiMgJyArIGRhdGEgKyAnICovJztcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuXG52YXIgc3R5bGVzSW5Eb20gPSB7fTtcblxudmFyXHRtZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG5cdHZhciBtZW1vO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHR5cGVvZiBtZW1vID09PSBcInVuZGVmaW5lZFwiKSBtZW1vID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRyZXR1cm4gbWVtbztcblx0fTtcbn07XG5cbnZhciBpc09sZElFID0gbWVtb2l6ZShmdW5jdGlvbiAoKSB7XG5cdC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG5cdC8vIEBzZWUgaHR0cDovL2Jyb3dzZXJoYWNrcy5jb20vI2hhY2stZTcxZDg2OTJmNjUzMzQxNzNmZWU3MTVjMjIyY2I4MDVcblx0Ly8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlclxuXHQvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcblx0Ly8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG5cdHJldHVybiB3aW5kb3cgJiYgZG9jdW1lbnQgJiYgZG9jdW1lbnQuYWxsICYmICF3aW5kb3cuYXRvYjtcbn0pO1xuXG52YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xufTtcblxudmFyIGdldEVsZW1lbnQgPSAoZnVuY3Rpb24gKGZuKSB7XG5cdHZhciBtZW1vID0ge307XG5cblx0cmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHBhc3NpbmcgZnVuY3Rpb24gaW4gb3B0aW9ucywgdGhlbiB1c2UgaXQgZm9yIHJlc29sdmUgXCJoZWFkXCIgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAvLyBVc2VmdWwgZm9yIFNoYWRvdyBSb290IHN0eWxlIGkuZVxuICAgICAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgICAgICAvLyAgIGluc2VydEludG86IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9vXCIpLnNoYWRvd1Jvb3QgfVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0dmFyIHN0eWxlVGFyZ2V0ID0gZ2V0VGFyZ2V0LmNhbGwodGhpcywgdGFyZ2V0KTtcblx0XHRcdC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cdFx0XHRpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Ly8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcblx0XHRcdFx0XHQvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuXHRcdFx0XHRcdHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG5cdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdHN0eWxlVGFyZ2V0ID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG5cdFx0fVxuXHRcdHJldHVybiBtZW1vW3RhcmdldF1cblx0fTtcbn0pKCk7XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyXHRzaW5nbGV0b25Db3VudGVyID0gMDtcbnZhclx0c3R5bGVzSW5zZXJ0ZWRBdFRvcCA9IFtdO1xuXG52YXJcdGZpeFVybHMgPSByZXF1aXJlKFwiLi91cmxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcblx0aWYgKHR5cGVvZiBERUJVRyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBERUJVRykge1xuXHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdG9wdGlvbnMuYXR0cnMgPSB0eXBlb2Ygb3B0aW9ucy5hdHRycyA9PT0gXCJvYmplY3RcIiA/IG9wdGlvbnMuYXR0cnMgOiB7fTtcblxuXHQvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXHRpZiAoIW9wdGlvbnMuc2luZ2xldG9uICYmIHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiAhPT0gXCJib29sZWFuXCIpIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIDxoZWFkPiBlbGVtZW50XG4gICAgICAgIGlmICghb3B0aW9ucy5pbnNlcnRJbnRvKSBvcHRpb25zLmluc2VydEludG8gPSBcImhlYWRcIjtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSBib3R0b20gb2YgdGhlIHRhcmdldFxuXHRpZiAoIW9wdGlvbnMuaW5zZXJ0QXQpIG9wdGlvbnMuaW5zZXJ0QXQgPSBcImJvdHRvbVwiO1xuXG5cdHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucyk7XG5cblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlIChuZXdMaXN0KSB7XG5cdFx0dmFyIG1heVJlbW92ZSA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QsIG9wdGlvbnMpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXG5cdFx0XHRpZihkb21TdHlsZS5yZWZzID09PSAwKSB7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuXG5mdW5jdGlvbiBhZGRTdHlsZXNUb0RvbSAoc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oaXRlbS5wYXJ0c1tqXSk7XG5cdFx0XHR9XG5cblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0VG9TdHlsZXMgKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXG5cdFx0aWYoIW5ld1N0eWxlc1tpZF0pIHN0eWxlcy5wdXNoKG5ld1N0eWxlc1tpZF0gPSB7aWQ6IGlkLCBwYXJ0czogW3BhcnRdfSk7XG5cdFx0ZWxzZSBuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQgKG9wdGlvbnMsIHN0eWxlKSB7XG5cdHZhciB0YXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblxuXHRpZiAoIXRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cblx0dmFyIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wID0gc3R5bGVzSW5zZXJ0ZWRBdFRvcFtzdHlsZXNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XG5cdFx0aWYgKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xuXHRcdH0gZWxzZSBpZiAobGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0XHR9XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5wdXNoKHN0eWxlKTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0fSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJvYmplY3RcIiAmJiBvcHRpb25zLmluc2VydEF0LmJlZm9yZSkge1xuXHRcdHZhciBuZXh0U2libGluZyA9IGdldEVsZW1lbnQob3B0aW9ucy5pbnNlcnRJbnRvICsgXCIgXCIgKyBvcHRpb25zLmluc2VydEF0LmJlZm9yZSk7XG5cdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgbmV4dFNpYmxpbmcpO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIltTdHlsZSBMb2FkZXJdXFxuXFxuIEludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciAnaW5zZXJ0QXQnICgnb3B0aW9ucy5pbnNlcnRBdCcpIGZvdW5kLlxcbiBNdXN0IGJlICd0b3AnLCAnYm90dG9tJywgb3IgT2JqZWN0LlxcbiAoaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIjaW5zZXJ0YXQpXFxuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudCAoc3R5bGUpIHtcblx0aWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblx0c3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG5cblx0dmFyIGlkeCA9IHN0eWxlc0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZSk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXG5cdGlmKG9wdGlvbnMuYXR0cnMudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXHR9XG5cblx0YWRkQXR0cnMoc3R5bGUsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGUpO1xuXG5cdHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblxuXHRpZihvcHRpb25zLmF0dHJzLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0fVxuXHRvcHRpb25zLmF0dHJzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXG5cdGFkZEF0dHJzKGxpbmssIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgbGluayk7XG5cblx0cmV0dXJuIGxpbms7XG59XG5cbmZ1bmN0aW9uIGFkZEF0dHJzIChlbCwgYXR0cnMpIHtcblx0T2JqZWN0LmtleXMoYXR0cnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGUgKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGUsIHVwZGF0ZSwgcmVtb3ZlLCByZXN1bHQ7XG5cblx0Ly8gSWYgYSB0cmFuc2Zvcm0gZnVuY3Rpb24gd2FzIGRlZmluZWQsIHJ1biBpdCBvbiB0aGUgY3NzXG5cdGlmIChvcHRpb25zLnRyYW5zZm9ybSAmJiBvYmouY3NzKSB7XG5cdCAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybShvYmouY3NzKTtcblxuXHQgICAgaWYgKHJlc3VsdCkge1xuXHQgICAgXHQvLyBJZiB0cmFuc2Zvcm0gcmV0dXJucyBhIHZhbHVlLCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIHJ1bm5pbmcgcnVudGltZSB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIGNzcy5cblx0ICAgIFx0b2JqLmNzcyA9IHJlc3VsdDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIElmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5IHZhbHVlLCBkb24ndCBhZGQgdGhpcyBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIGNvbmRpdGlvbmFsIGxvYWRpbmcgb2YgY3NzXG5cdCAgICBcdHJldHVybiBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHQvLyBub29wXG5cdCAgICBcdH07XG5cdCAgICB9XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcblx0XHR2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcblxuXHRcdHN0eWxlID0gc2luZ2xldG9uIHx8IChzaW5nbGV0b24gPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuXG5cdFx0dXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG5cdFx0cmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcblxuXHR9IGVsc2UgaWYgKFxuXHRcdG9iai5zb3VyY2VNYXAgJiZcblx0XHR0eXBlb2YgVVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5yZXZva2VPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBCbG9iID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiXG5cdCkge1xuXHRcdHN0eWxlID0gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gdXBkYXRlTGluay5iaW5kKG51bGwsIHN0eWxlLCBvcHRpb25zKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuXG5cdFx0XHRpZihzdHlsZS5ocmVmKSBVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlLmhyZWYpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0c3R5bGUgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuXHRcdH07XG5cdH1cblxuXHR1cGRhdGUob2JqKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUgKG5ld09iaikge1xuXHRcdGlmIChuZXdPYmopIHtcblx0XHRcdGlmIChcblx0XHRcdFx0bmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJlxuXHRcdFx0XHRuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJlxuXHRcdFx0XHRuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR1cGRhdGUob2JqID0gbmV3T2JqKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVtb3ZlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG52YXIgcmVwbGFjZVRleHQgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgdGV4dFN0b3JlID0gW107XG5cblx0cmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcblx0XHR0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG5cblx0XHRyZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblx0fTtcbn0pKCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcgKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xuXG5cdGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuXHRcdHZhciBjaGlsZE5vZGVzID0gc3R5bGUuY2hpbGROb2RlcztcblxuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGUucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuXG5cdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRzdHlsZS5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZS5hcHBlbmRDaGlsZChjc3NOb2RlKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyAoc3R5bGUsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuXG5cdGlmKG1lZGlhKSB7XG5cdFx0c3R5bGUuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXG5cdH1cblxuXHRpZihzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuXHR9IGVsc2Uge1xuXHRcdHdoaWxlKHN0eWxlLmZpcnN0Q2hpbGQpIHtcblx0XHRcdHN0eWxlLnJlbW92ZUNoaWxkKHN0eWxlLmZpcnN0Q2hpbGQpO1xuXHRcdH1cblxuXHRcdHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmsgKGxpbmssIG9wdGlvbnMsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cblx0Lypcblx0XHRJZiBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgaXNuJ3QgZGVmaW5lZCwgYnV0IHNvdXJjZW1hcHMgYXJlIGVuYWJsZWRcblx0XHRhbmQgdGhlcmUgaXMgbm8gcHVibGljUGF0aCBkZWZpbmVkIHRoZW4gbGV0cyB0dXJuIGNvbnZlcnRUb0Fic29sdXRlVXJsc1xuXHRcdG9uIGJ5IGRlZmF1bHQuICBPdGhlcndpc2UgZGVmYXVsdCB0byB0aGUgY29udmVydFRvQWJzb2x1dGVVcmxzIG9wdGlvblxuXHRcdGRpcmVjdGx5XG5cdCovXG5cdHZhciBhdXRvRml4VXJscyA9IG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzID09PSB1bmRlZmluZWQgJiYgc291cmNlTWFwO1xuXG5cdGlmIChvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyB8fCBhdXRvRml4VXJscykge1xuXHRcdGNzcyA9IGZpeFVybHMoY3NzKTtcblx0fVxuXG5cdGlmIChzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rLmhyZWY7XG5cblx0bGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblxuXHRpZihvbGRTcmMpIFVSTC5yZXZva2VPYmplY3RVUkwob2xkU3JjKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSAyMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8qKlxuICogV2hlbiBzb3VyY2UgbWFwcyBhcmUgZW5hYmxlZCwgYHN0eWxlLWxvYWRlcmAgdXNlcyBhIGxpbmsgZWxlbWVudCB3aXRoIGEgZGF0YS11cmkgdG9cbiAqIGVtYmVkIHRoZSBjc3Mgb24gdGhlIHBhZ2UuIFRoaXMgYnJlYWtzIGFsbCByZWxhdGl2ZSB1cmxzIGJlY2F1c2Ugbm93IHRoZXkgYXJlIHJlbGF0aXZlIHRvIGFcbiAqIGJ1bmRsZSBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IHBhZ2UuXG4gKlxuICogT25lIHNvbHV0aW9uIGlzIHRvIG9ubHkgdXNlIGZ1bGwgdXJscywgYnV0IHRoYXQgbWF5IGJlIGltcG9zc2libGUuXG4gKlxuICogSW5zdGVhZCwgdGhpcyBmdW5jdGlvbiBcImZpeGVzXCIgdGhlIHJlbGF0aXZlIHVybHMgdG8gYmUgYWJzb2x1dGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHBhZ2UgbG9jYXRpb24uXG4gKlxuICogQSBydWRpbWVudGFyeSB0ZXN0IHN1aXRlIGlzIGxvY2F0ZWQgYXQgYHRlc3QvZml4VXJscy5qc2AgYW5kIGNhbiBiZSBydW4gdmlhIHRoZSBgbnBtIHRlc3RgIGNvbW1hbmQuXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcykge1xuICAvLyBnZXQgY3VycmVudCBsb2NhdGlvblxuICB2YXIgbG9jYXRpb24gPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5sb2NhdGlvbjtcblxuICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZml4VXJscyByZXF1aXJlcyB3aW5kb3cubG9jYXRpb25cIik7XG4gIH1cblxuXHQvLyBibGFuayBvciBudWxsP1xuXHRpZiAoIWNzcyB8fCB0eXBlb2YgY3NzICE9PSBcInN0cmluZ1wiKSB7XG5cdCAgcmV0dXJuIGNzcztcbiAgfVxuXG4gIHZhciBiYXNlVXJsID0gbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0O1xuICB2YXIgY3VycmVudERpciA9IGJhc2VVcmwgKyBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qJC8sIFwiL1wiKTtcblxuXHQvLyBjb252ZXJ0IGVhY2ggdXJsKC4uLilcblx0Lypcblx0VGhpcyByZWd1bGFyIGV4cHJlc3Npb24gaXMganVzdCBhIHdheSB0byByZWN1cnNpdmVseSBtYXRjaCBicmFja2V0cyB3aXRoaW5cblx0YSBzdHJpbmcuXG5cblx0IC91cmxcXHMqXFwoICA9IE1hdGNoIG9uIHRoZSB3b3JkIFwidXJsXCIgd2l0aCBhbnkgd2hpdGVzcGFjZSBhZnRlciBpdCBhbmQgdGhlbiBhIHBhcmVuc1xuXHQgICAoICA9IFN0YXJ0IGEgY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgKD86ICA9IFN0YXJ0IGEgbm9uLWNhcHR1cmluZyBncm91cFxuXHQgICAgICAgICBbXikoXSAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKD86ICA9IFN0YXJ0IGFub3RoZXIgbm9uLWNhcHR1cmluZyBncm91cHNcblx0ICAgICAgICAgICAgICAgICBbXikoXSsgID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgICAgIFteKShdKiAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICBcXCkgID0gTWF0Y2ggYSBlbmQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICkgID0gRW5kIEdyb3VwXG4gICAgICAgICAgICAgICpcXCkgPSBNYXRjaCBhbnl0aGluZyBhbmQgdGhlbiBhIGNsb3NlIHBhcmVuc1xuICAgICAgICAgICkgID0gQ2xvc2Ugbm9uLWNhcHR1cmluZyBncm91cFxuICAgICAgICAgICogID0gTWF0Y2ggYW55dGhpbmdcbiAgICAgICApICA9IENsb3NlIGNhcHR1cmluZyBncm91cFxuXHQgXFwpICA9IE1hdGNoIGEgY2xvc2UgcGFyZW5zXG5cblx0IC9naSAgPSBHZXQgYWxsIG1hdGNoZXMsIG5vdCB0aGUgZmlyc3QuICBCZSBjYXNlIGluc2Vuc2l0aXZlLlxuXHQgKi9cblx0dmFyIGZpeGVkQ3NzID0gY3NzLnJlcGxhY2UoL3VybFxccypcXCgoKD86W14pKF18XFwoKD86W14pKF0rfFxcKFteKShdKlxcKSkqXFwpKSopXFwpL2dpLCBmdW5jdGlvbihmdWxsTWF0Y2gsIG9yaWdVcmwpIHtcblx0XHQvLyBzdHJpcCBxdW90ZXMgKGlmIHRoZXkgZXhpc3QpXG5cdFx0dmFyIHVucXVvdGVkT3JpZ1VybCA9IG9yaWdVcmxcblx0XHRcdC50cmltKClcblx0XHRcdC5yZXBsYWNlKC9eXCIoLiopXCIkLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pXG5cdFx0XHQucmVwbGFjZSgvXicoLiopJyQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSk7XG5cblx0XHQvLyBhbHJlYWR5IGEgZnVsbCB1cmw/IG5vIGNoYW5nZVxuXHRcdGlmICgvXigjfGRhdGE6fGh0dHA6XFwvXFwvfGh0dHBzOlxcL1xcL3xmaWxlOlxcL1xcL1xcL3xcXHMqJCkvaS50ZXN0KHVucXVvdGVkT3JpZ1VybCkpIHtcblx0XHQgIHJldHVybiBmdWxsTWF0Y2g7XG5cdFx0fVxuXG5cdFx0Ly8gY29udmVydCB0aGUgdXJsIHRvIGEgZnVsbCB1cmxcblx0XHR2YXIgbmV3VXJsO1xuXG5cdFx0aWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiLy9cIikgPT09IDApIHtcblx0XHQgIFx0Ly9UT0RPOiBzaG91bGQgd2UgYWRkIHByb3RvY29sP1xuXHRcdFx0bmV3VXJsID0gdW5xdW90ZWRPcmlnVXJsO1xuXHRcdH0gZWxzZSBpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byB0aGUgYmFzZSB1cmxcblx0XHRcdG5ld1VybCA9IGJhc2VVcmwgKyB1bnF1b3RlZE9yaWdVcmw7IC8vIGFscmVhZHkgc3RhcnRzIHdpdGggJy8nXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG5cdFx0XHRuZXdVcmwgPSBjdXJyZW50RGlyICsgdW5xdW90ZWRPcmlnVXJsLnJlcGxhY2UoL15cXC5cXC8vLCBcIlwiKTsgLy8gU3RyaXAgbGVhZGluZyAnLi8nXG5cdFx0fVxuXG5cdFx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCB1cmwoLi4uKVxuXHRcdHJldHVybiBcInVybChcIiArIEpTT04uc3RyaW5naWZ5KG5ld1VybCkgKyBcIilcIjtcblx0fSk7XG5cblx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCBjc3Ncblx0cmV0dXJuIGZpeGVkQ3NzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvdXJscy5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==