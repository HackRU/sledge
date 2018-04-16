(function (sledge) {
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
