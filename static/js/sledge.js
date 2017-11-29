(function () {
"use strict";

var socket = null;
var subscribers = [];

var tables = {
    initialized: false,

    hacks: [], // {id, name, description, location}
    judges: [], // {id, name, email}
    judgeHacks: [], // {id, judgeId, hackId}
    superlatives: [], // {id, name}
    superlativePlacements: [], // {id, judgeId, firstChoice, secondChoice}
    ratings: [], // {id, judgeId, hackId, rating}
};

function sendChange() {
    for (sub of subscribers)
        if (sub)
            sub();
}

function onDataDump(data) {
    console.log("Data Dump", data);
}

//////////////////
// Exported functions

// Subscribe to notifications for changes
function subscribeSledge(cb) {
    subscribers.push(cb);
}
window.subscribeSledge = subscribeSledge;

// Returns the current state of sledge.js, for debugging only
function getSledgeDebugData() {
    return {
        socket, tables, subscribers
    };
}
window.getSledgeDebugData = getSledgeDebugData;

// Initializes the socket connection
function initSledge() {
    if (socket) {
        throw new Error("Sledge: Socket already initialized!");
    }

    socket = io();

    socket.on("datadump", onDataDump);
}
window.initSledge = initSledge;
})();
