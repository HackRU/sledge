(function () {
"use strict";

var socket = null;
var subscribers = [];
var handlers = [];
var initialized = false;

////////////////////
// Global Tables

var tables = {
    hacks: [], // {id, name, description, location}
    judges: [], // {id, name, email}
    judgeHacks: [], // {id, judgeId, hackId}
    superlatives: [], // {id, name}
    superlativePlacements: [], // {id, judgeId, superlativeId, firstChoice, secondChoice}
    ratings: [], // {id, judgeId, hackId, rating}
};

////////////////////
// Private Helpers

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

function sendChange(content) {
    for (let sub of subscribers)
        if (sub) sub(content);
}

////////////////////
// Update Handlers

function onError(data) {
    console.log("Error", data);
}
handlers.push({ name: "error", handler: onError });

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

function onUpdatePartial(data) {
    if ( !initialized ) return;
    updateTables(data);

    sendChange({
        trans: false,
        type: "partial"
    });
}
handlers.push({ name: "update-partial", handler: onUpdatePartial });

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

function sendScrapeDevpost({url}) {
    socket.emit("devpost-scrape", {url});
}
addTransientResponse("devpost-scrape-response");

function sendAddJudge({name, email}) {
    socket.emit("add-judge", {name, email});
}
addTransientResponse("add-judge-response");

function sendAddSuperlative({name}) {
    socket.emit("add-superlative", {name});
}
addTransientResponse("add-superlative-response");

function sendAddToken({judgeId, secret}) {
    socket.emit("add-token", {judgeId, secret});
}
function sendRaw({eventName, json}) {
    socket.emit(eventName, json);
}
addTransientResponse("add-token-response");

function sendRankSuperlative(data) {
    socket.emit("rank-superlative", {
        judgeId: data.judgeId,
        superlativeId: data.superlativeId,
        firstChoiceId: data.firstChoiceId,
        secondChoiceId: data.secondChoiceId
    });
}
addTransientResponse("rank-superlative-response");

function sendRateHack({judgeId, hackId, rating}) {
    socket.emit("rate-hack", {
        judgeId, hackId, rating
    });
}
addTransientResponse("rate-hack-response");

////////////////////
// Information Querying

function isInitialized() {
    return initialized;
}

function getAllHacks() {
    if (!initialized) throw new Error("getAllHacks: Data not initialized");

    return tables.hacks;
}

function getAllJudges() {
    if (!initialized) throw new Error("getAllJudges: Data not initialized");

    return tables.judges;
}

function getJudgeInfo({judgeId}) {
    if (!initialized) throw new Error("getJudgeInfo: Data not initialized");

    return tables.judges[judgeId] || null;
}

function getHacksOrder({judgeId}) {
    if (!initialized) throw new Error("getHacksOrder: Data not initialized");

    // TODO: Look through judgeHacks table,
    //       instead of returning all hacks
    // TODO: Order by location
    let order     = [];
    let positions = [];
    for (let i=0,pos=0;i<tables.hacks.length;i++) {
        if ( tables.hacks[i] ) {
            positions[i] = pos;
            order[pos++] = i;
        }
    }

    // order maps position to hackId
    // positions maps hackId to position
    return { order, positions };
}

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

////////////////////
// Other Exports

function subscribe(cb) {
    subscribers.push(cb);
}

function init(opts) {
    if (socket) {
        throw new Error("Sledge: Socket already initialized!");
    }

    socket = io({query: "secret="+encodeURIComponent(opts.token)});

    for (let h of handlers) {
        socket.on(h.name, h.handler);
    }
}

window.sledge = {
    _socket: () => socket,
    _subscribers: subscribers,
    _handlers: handlers,
    _initialized: () => initialized,

    _tables: tables,

    _updateTables: updateTables,
    _sendChange: sendChange,

    _onError: onError,
    _onUpdateFull: onUpdateFull,
    _onUpdatePartial: onUpdatePartial,

    _addTransientResponse: addTransientResponse,
    sendScrapeDevpost,
    sendAddJudge,
    sendAddSuperlative,
    sendAddToken,
    sendRankSuperlative,
    sendRateHack,
    sendRaw,

    isInitialized,
    getAllHacks,
    getAllJudges,
    getJudgeInfo,
    getHacksOrder,
    getAllRatings,
    getJudgeRatings,
    getSuperlatives,
    getAllSuperlativePlacements,
    getChosenSuperlatives,

    subscribe,
    init
};

})();
