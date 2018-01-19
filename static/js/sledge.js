(function () {
"use strict";

var socket = null;
var subscribers = [];
var initialized = false;

var tables = {
    hacks: [], // {id, name, description, location}
    judges: [], // {id, name, email}
    judgeHacks: [], // {id, judgeId, hackId}
    superlatives: [], // {id, name}
    superlativePlacements: [], // {id, judgeId, firstChoice, secondChoice}
    ratings: [], // {id, judgeId, hackId, rating}
};

function sendChange(content) {
    for (let sub of subscribers)
        if (sub) sub(content);
}

////////////////////
// Socket Handlers

function onError(data) {
    console.log("Error", data);
}

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

function onUpdatePartial(data) {
    if ( !initialized ) return;
    updateTables(data);

    sendChange({
        trans: false,
        type: "partial"
    });
}

// All responses are transient, however in some cases the server will also
// send a non-transient response

function onDevpostScrapeResponse(data) {
    console.log("Recieved devpost-scrape-response", data);

    sendChange({
        trans: true,
        type: "Devpost Scrape",
        data
    });
}

function onAddJudgeResponse(data) {
    console.log("Recieved add-judge-response", data);

    sendChange({
        trans: true,
        type: "Add Judge",
        data
    });
}

function onAddSuperlativeResponse(data) {
    console.log("Recieved add-superlative-response", data);

    sendChange({
        trans: true,
        type: "Add Superlative",
        data
    });
}

////////////////////
// Helpers

function updateTables(data) {
    for ( let table of Object.keys(tables) ) {
        if ( data[table] ) {
            for ( let row of data[table] ) {
                if ( row.id ) {
                    tables[table][row.id] = row;
                }
            }
        }
    }
}

//////////////////
// Exported functions

function sendRaw(evt, data) {
    socket.emit(evt, data);
}

function scrapeDevpost(url) {
    socket.emit("devpost-scrape", {
        url: url.toString(),
    });
}

function addJudge(name, email) {
    socket.emit("add-judge", {
        name: name.toString(),
        email: email.toString(),
    });
}

function addSuperlative(name) {
    socket.emit("add-superlative", {
        name: name.toString()
    });
}

// Subscribe to notifications for changes
function subscribe(cb) {
    subscribers.push(cb);
}

// Getting information
//  (Returns from these functions should be treated as readonly)

function isInitialized() {
    return initialized;
}

function getJudgeInfo(judgeId) {
    if (!initialized) throw new Error("getJudgeInfo: Data not initialized");

    return tables.judges[judgeId] || null;
}

function getJudgeHacks(judgeId) {
    if (!initialized) throw new Error("getJudgeHacks: Data not initialized");

    //TODO: Get only hacks by judge
    let judgeHacks = [];
    for ( let hack of tables.hacks ) {
        if ( hack ) {
            judgeHacks.push( hack );
        }
    }

    return judgeHacks;
}

function getSuperlatives() {
    if (!initialized) throw new Error("getJudgeHacks: Data not initialized");

    let superlatives = [];
    for ( let superlative of tables.superlatives ) {
        if ( superlative ) {
            superlatives.push(superlative);
        }
    }

    return superlatives;
}

function init() {
    if (socket) {
        throw new Error("Sledge: Socket already initialized!");
    }

    socket = io();

    socket.on('error', onError);
    socket.on("update-full", onUpdateFull);
    socket.on("update-partial", onUpdatePartial);
    socket.on("devpost-scrape-response", onDevpostScrapeResponse);
    socket.on("add-judge-response", onAddJudgeResponse);
    socket.on("add-superlative-response", onAddSuperlativeResponse);
}

window.sledge = {
    init,
    subscribe,

    sendRaw,
    scrapeDevpost,
    addJudge,
    addSuperlative,

    isInitialized,
    getJudgeInfo,
    getJudgeHacks,
    getSuperlatives,

    _tables: tables,
};

})();
