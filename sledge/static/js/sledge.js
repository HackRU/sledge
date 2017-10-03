(function () {
"use strict";

var socket;

// Emit Wrappers

function sendListJudges() {
    socket.emit("list-judges");
}
window.sendListJudges = sendListJudges;

function sendListPrizes() {
    socket.emit("list-prizes");
}
window.sendListPrizes = sendListPrizes;

function sendListHacks() {
    socket.emit("list-hacks");
}
window.sendListHacks = sendListHacks;

function sendAddJudge(data) {
    socket.emit("add-judge", {
        name: data.name,
        email: data.email
    });
}
window.sendAddJudge = sendAddJudge;

// Socket Events

function onConnect() {
    console.log("Connected");
}

function onJudged() {
    console.log("Judged");
}

function onJudgesList(data) {
    console.log("Judges List: ", data);
}

function onListHacks(data) {
    console.log("List Hacks: ", data);
}

function onAddJudge(data) {
    console.log("Add Judge: ", data);
}

// Init

function initSocket({token, isAdmin=false}) {
    socket = io({query: `tok=${encodeURIComponent(token)}&admin=${isAdmin}`});

    socket.on("connect", onConnect);
    socket.on("judged", onJudged);
    socket.on("judges-list", onJudgesList);
    socket.on("list-hacks", onListHacks);
    socket.on("add-judge", onAddJudge);
}
window.initSocket = initSocket;

})();
