(function () {
"use strict";

var socket;
var updateListeners = [];

var sledgeState = {
    hacks: [],
    myHacks: [],
    myHackPositions: [],

    judges: [],
    myJudgeId: 0,
    myTotalHacks: 0,

    superlatives: [],
    superlativesAwarded: [],

    ratingCategories: [{
        name: "Egregiousness",
        possibilities: [0,1,2,3,4,5]
    }, {
        name: "Homeliness",
        possibilities: [0,1,2,3,4,5]
    }, {
        name: "Abhorentness",
        possibilities: [0,1,2,3,4,5]
    }, {
        name: "Inoperativeness",
        possibilities: [0,1,2,3,4,5]
    }],
    ratings: [],
};

// State that should probably be send to the server
function sendRating(hackId, rating) {
    sledgeState.ratings[hackId] = rating;
}
window.sendRating = sendRating;

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

function sendViewHacks(data) {
    socket.emit("view-hacks", {
        judge_id: data.judgeId,
    });
}
window.sendViewHacks = sendViewHacks;

function sendListRatings() {
    socket.emit("list-ratings");
}
window.sendListRatings = sendListRatings;

function sendAddRating(data) {
    socket.emit("add-rating", {
        judge_id: data.judgeId,
        hack_id: data.hackId,
        rating: data.rating,
    });
}
window.sendAddRating = sendAddRating;

function sendAddSuperlative(data) {
    socket.emit("add-superlative", {
        judge_id: data.judgeId,
        prize_id: data.prizeId,
        hack1: data.hack1,
        hack2: data.hack2
    });
}
window.sendAddSuperlative = sendAddSuperlative;

function sendListSuperlatives() {
    socket.emit("list-superlatives");
}
window.sendListSuperlatives = sendListSuperlatives;

// Socket Events

function onConnect() {
    console.log("Connected");
}

function onError(e) {
    console.log("Error!", e);
}

function onJudged() {
    console.log("Judged");

    notifyUpdateListeners();
}

function onJudgesList(data) {
    let judges = JSON.parse(data);
    for (let judge of judges) {
        sledgeState.judges[judge.id] = {
            id: judge.id,
            name: judge.name,
            email: judge.email,
            currLoc: judge.curr_loc,
            startLoc: judge.start_loc,
            endLoc: judge.end_loc,
        }
    }

    // Make sure we're actually a judge
    if ( !sledgeState.judges[sledgeState.myJudgeId] ) {
        swal({
            title: "Unknown Judge Id!",
            text: `We have detected you are judge ${sledgeState.myJudgeId} but we are unable to find `+
                  `a judge with that id in the database. Please contact a sledge admin for assistance.`,
            icon: "error",
            button: {
                text: "Refresh",
                closeModal: false
            }
        }).then( () => window.location.reload() );
        throw new Error("Can't find judge "+sledgeState.myJudgeId+" in database.");
    }

    notifyUpdateListeners();
}

function onHacksList(data) {
    let hacks = JSON.parse(data);
    for (let hack of hacks) {
        sledgeState.hacks[hack.id] = hack;
        if (typeof sledgeState.ratings[hack.id] == "undefined")
            sledgeState.ratings[hack.id] = null;
    }

    // If this causes performance issues, change later
    let myself = sledgeState.judges[sledgeState.myJudgeId];
    sledgeState.myHacks = hacks.filter(x => !!x && x.id >= myself.startLoc && x.id < myself.endLoc).sort( (x,y) => {
        let i=0,j=0;
        let n1 = x.name.toLowerCase(),
            n2 = y.name.toLowerCase();
        while ( i <  n1.length && j < n2.length ) {
            if ( n1.charCodeAt(i) != n2.charCodeAt(j) )
                return n1.charCodeAt(i) - n2.charCodeAt(j);
            i++;j++;
        }
        return n1.length < n2.length;
    });
    for (let i=0;i<sledgeState.myHacks.length;i++) {
        sledgeState.myHackPositions[sledgeState.myHacks[i].id] = i;
    }
    sledgeState.myTotalHacks = sledgeState.myHacks.length;

    notifyUpdateListeners();
}

function onAddJudge(data) {
    console.log("Add Judge: ", data);

    notifyUpdateListeners();
}

function onHacksForJudge(data) {
    console.log("Hacks for Judge: ", JSON.parse(data));

    notifyUpdateListeners();
}

function onRatingsList(data) {
    let ratings = JSON.parse(data);

    for (let rating of ratings) {
        if (rating.judge_id == sledgeState.myJudgeId) {
            sledgeState.ratings[rating.hack_id] = rating.rating;
        }
    }

    notifyUpdateListeners();
}

function onSuperlativesList(data) {
    for (let sup of data) {
        if (sup.judge_id == judgeState.myJudgeId) {
            sledgeState.superlativesAwarded[sup.prize_id] = sup;
        }
    }

    notifyUpdateListeners();
}

function onPrizesList(data) {
    let prizes = JSON.parse(data);
    for (let prize of prizes) {
        sledgeState.superlatives[prize.id] = prize;
    }

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

function initSocket({token, judgeId, isAdmin=false}) {
    sledgeState.myJudgeId = judgeId;

    socket = io({query: `tok=${encodeURIComponent(token)}&admin=${isAdmin}`});

    socket.on("connect", onConnect);
    socket.on("error", onError);
    socket.on("judged", onJudged);
    socket.on("judges-list", onJudgesList);
    socket.on("hacks-list", onHacksList);
    socket.on("add-judge", onAddJudge);
    socket.on("hacks-for-judge", onHacksForJudge);
    socket.on("ratings-list", onRatingsList);
    socket.on("superlatives-list", onSuperlativesList);
    socket.on("prizes-list", onPrizesList);
}
window.initSocket = initSocket;

})();
