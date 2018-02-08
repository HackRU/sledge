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
    superlativePlacements: [], // {id, judgeId, superlativeId, firstChoice, secondChoice}
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

function onAddTokenResponse(data) {
    console.log("Recieved add-token-response", data);

    sendChange({
        trans: true,
        type: "Add Token",
        data
    });
}

function onRankSuperlativeResponse(data) {
    console.log("Recieved rank-superlative-response", data);

    sendChange({
        trans: true,
        type: "Rank Superlative",
        data
    });
}

function onRateHackResponse(data) {
    console.log("Recieved rate-hack-response", data);

    sendChange({
        trans: true,
        type: "Rate Hack",
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

function addToken(judgeId, secret) {
    socket.emit("add-token", {
        judgeId: parseInt(judgeId),
        secret: secret.toString()
    });
}

function rankSuperlative(judgeId, superlativeId, firstChoiceId, secondChoiceId) {
    socket.emit("rank-superlative", {
        judgeId, superlativeId, firstChoiceId, secondChoiceId
    });
}

function rateHack(judgeId, hackId, rating) {
    socket.emit("rate-hack", {
        judgeId, hackId, rating
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

function getHacksTable() {
    return tables.hacks;
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

function getJudgeRatings(judgeId) {
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

function getChosenSuperlatives(judgeId) {
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

function init(opts) {
    if (socket) {
        throw new Error("Sledge: Socket already initialized!");
    }

    socket = io({query: "secret="+encodeURIComponent(opts.token)});

    socket.on('error', onError);
    socket.on("update-full", onUpdateFull);
    socket.on("update-partial", onUpdatePartial);
    socket.on("devpost-scrape-response", onDevpostScrapeResponse);
    socket.on("add-judge-response", onAddJudgeResponse);
    socket.on("add-superlative-response", onAddSuperlativeResponse);
    socket.on("add-token-response", onAddTokenResponse);
    socket.on("rank-superlative-response", onRankSuperlativeResponse);
    socket.on("rate-hack-response", onRateHackResponse);
}

window.sledge = {
    init,
    subscribe,

    sendRaw,
    scrapeDevpost,
    addJudge,
    addSuperlative,
    rankSuperlative,
    rateHack,

    getHacksTable,

    isInitialized,
    getJudgeInfo,
    getJudgeHacks,
    getSuperlatives,
    getChosenSuperlatives,
    getJudgeRatings,

    _tables: tables,
};

})();
