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
    console.log("TODO: Handle data full", data);
}

function onUpdatePartial(data) {
    console.log("TODO: Handle data partial", data);
}

function onDevpostScrapeResponse(data) {
    console.log("Recieved devpost-scrape-response", data);

    sendChange({
        trans: true,
        type: "Devpost Scrape",
        data
    });
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

// Subscribe to notifications for changes
function subscribe(cb) {
    subscribers.push(cb);
}

// Returns the current state of sledge.js, for debugging only
function getDebugData() {
    return {
        socket, tables, subscribers
    };
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
}

window.sledge = {
    init,
    subscribe,

    sendRaw,
    scrapeDevpost,

    getDebugData,
};

})();
