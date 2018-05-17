import io from "socket.io-client";

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

export function sendScrapeDevpost({url}) {
    socket.emit("devpost-scrape", {url});
}
addTransientResponse("devpost-scrape-response");

export function sendAddJudge({name, email}) {
    socket.emit("add-judge", {name, email});
}
addTransientResponse("add-judge-response");

export function sendAllocateJudges(opts) {
    if (!opts.method) throw new Error("allocateJudgeHacks: method must exist");

    socket.emit("allocate-judges", opts);
}
addTransientResponse("allocate-judges-response");

export function sendAddSuperlative({name}) {
    socket.emit("add-superlative", {name});
}
addTransientResponse("add-superlative-response");

export function sendAddToken({judgeId, secret}) {
    socket.emit("add-token", {judgeId, secret});
}
addTransientResponse("add-token-response");

export function sendRaw({eventName, json}) {
    socket.emit(eventName, json);
}
addTransientResponse("add-token-response");

export function sendRankSuperlative(data) {
    socket.emit("rank-superlative", {
        judgeId: data.judgeId,
        superlativeId: data.superlativeId,
        firstChoiceId: data.firstChoiceId,
        secondChoiceId: data.secondChoiceId
    });
}
addTransientResponse("rank-superlative-response");

export function sendRateHack({judgeId, hackId, rating}) {
    socket.emit("rate-hack", {
        judgeId, hackId, rating
    });
}
addTransientResponse("rate-hack-response");

////////////////////
// Information Querying

export function isInitialized() {
    return initialized;
}

export function getAllHacks() {
    if (!initialized) throw new Error("getAllHacks: Data not initialized");

    return tables.hacks;
}

export function getAllJudges() {
    if (!initialized) throw new Error("getAllJudges: Data not initialized");

    return tables.judges;
}

export function getJudgeInfo({judgeId}) {
    if (!initialized) throw new Error("getJudgeInfo: Data not initialized");

    return tables.judges[judgeId] || null;
}

export function getHacksOrder({judgeId}) {
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

export function getAllRatings() {
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

export function getJudgeRatings({judgeId}) {
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

export function getSuperlatives() {
    if (!initialized) throw new Error("getSuperlatives: Data not initialized");

    let superlatives = [];
    for ( let superlative of tables.superlatives ) {
        if ( superlative ) {
            superlatives.push(superlative);
        }
    }

    return superlatives;
}

export function getAllSuperlativePlacements() {
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

export function getChosenSuperlatives({judgeId}) {
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

export function subscribe(cb) {
    subscribers.push(cb);
}

export function init(opts) {
    if (socket) {
        throw new Error("Sledge: Socket already initialized!");
    }

    socket = io({query: "secret="+encodeURIComponent(opts.token)});

    for (let h of handlers) {
        socket.on(h.name, h.handler);
    }
}

export function initWithTestData(testdata) {
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
