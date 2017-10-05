(function () {
"use strict";

var socket;
var updateListeners = [];

var sledgeState = {
    hacks: [],
    judges: []
};

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

    notifyUpdateListeners();
}

function onJudgesList(data) {
    let judges = JSON.parse(data);
    for (let judge of judges) {
        sledgeState.judges[judge.id] = data;
    }

    notifyUpdateListeners();
}

function onHacksList(data) {
    let hacks = JSON.parse(data);
    for (let hack of hacks) {
        sledgeState.hacks[hack.id] = hack;
    }

    notifyUpdateListeners();
}

function onAddJudge(data) {
    console.log("Add Judge: ", data);

    notifyUpdateListeners();
}

function notifyOnUpdate(cb) {
    updateListeners.push(cb);
}
window.notifyOnUpdate = notifyOnUpdate;

function notifyUpdateListeners() {
    for ( let cb of updateListeners ) cb();
}

// Other

function getSocket() {
    return socket;
}
window.getSocket = getSocket;

function getSledgeState() {
    return sledgeState;
}
window.getSledgeState = getSledgeState;

// Init

function initSocket({token, isAdmin=false}) {
    socket = io({query: `tok=${encodeURIComponent(token)}&admin=${isAdmin}`});

    socket.on("connect", onConnect);
    socket.on("judged", onJudged);
    socket.on("judges-list", onJudgesList);
    socket.on("hacks-list", onHacksList);
    socket.on("add-judge", onAddJudge);
}
window.initSocket = initSocket;

})();
