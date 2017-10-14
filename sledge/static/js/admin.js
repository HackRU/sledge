"use strict";

var socket = null
var hasInit = false;

function updateTable(table, items, rows) {
    $(table).html("");
    let thead = document.createElement("thead");
    let thead_tr = document.createElement("tr");
    for (let item of items) {
        let th = document.createElement("th");
        $(th).text(item.heading);
        $(thead_tr).append(th);
    }
    $(thead).append(thead_tr);
    $(table).append(thead);
    let tbody = document.createElement("tbody");
    for (let row of rows) {
        if (!row) continue;
        let tr = document.createElement("tr");
        for (let item of items) {
            let td = document.createElement("td");
            $(td).text(row[item.name]);
            $(tr).append(td);
        }
        $(tbody).append(tr);
    }
    $(table).append(tbody);
}

function updateTables() {
    let state = getSledgeState();

    let adminSecret = "";
    document.location.search.substr(1).split("&").forEach( q => {
        let a = q.sqlit("=");
        if ( a.length != 2 ) return;

        if ( a[0] == "secret" ) {
            try {
                adminSecret = decodeURIComponenet(a[1]);
            } catch (e) {
                adminSecret = a[1];
            }
        }
    });
    if (!adminSecret) {
        swal("Admin Secret missing from URL");
    }

}

function toggleShowPass() {
    let input = $("#adminSecret");
    if (input.attr("type") == "password") {
        input.attr("type", "text");
    } else {
        input.attr("type", "password");
    }
}

function init() {
    if (hasInit) {
        log("Initialize button pressed, but already initialized");
    }

    let adminPass = $("#adminSecret").val();
    localStorage.setItem("adminSecret", adminPass);

    log("Initialization Started");

    socket = io({query: "tok="+encodeURIComponent(adminPass)+"&admin=true"});

    socket.on("connect", function () {
        log("Connected");
    });
    socket.on("disconnect", function () {
        log("Disconnected (Note: Socketio will automatically try to reconnect gracefully)");
    });
    socket.on("reconnect", function () {
        log("Reconnected");
    });
    socket.on("error", function (e) {
        log("!!!!!!!!!!!");
        log(e.stack);
        log("!!!!!!!!!!!");
    });
    socket.on("judged", function (data) {
        log("Got Event: judged");
    });
    socket.on("judges-list", function (data) {
        log("Got Event: judges-list");
        let judges = JSON.parse(data);
        updateTable($("#judgesTable"), [
            { name: "id", heading: "id" },
            { name: "name", heading: "Name" },
            { name: "start_loc", heading: "Start Loc" },
            { name: "end_loc", heading: "End Loc" },
            { name: "curr_loc", heading: "Curr Loc (unused)" }],
            judges);
    });
    socket.on("hacks-list", function (data) {
        log("Got Event: hacks-list");
        let hacks = JSON.parse(data);
        updateTable($("#hacksTable"), [
            { name: "id", heading: "id" },
            { name: "name", heading: "Name" },
            { name: "location", heading: "Location" },
            { name: "description", heading: "Description" },
            { naem: "views", heading: "Views (unused)" }],
            hacks);
    });
    socket.on("prizes-list", function (data) {
        log("Got Event: superlatives-list");
        let supers = JSON.parse(data);
        updateTable($("#supersTable"), [
            { name: "id", heading: "id" },
            { name: "name", heading: "Name" },
            { name: "location", heading: "Location" },
            { name: "description", heading: "Description" },
            { name: "is_best_overall", heading: "Is Best Overall (unused)" }],
            supers);
    });
    socket.on("ratings-list", function (data) {
        log("Got Event: ratings-list");
        let ratings = JSON.parse(data);
        let judgeTotal = [];
        for (let rating of ratings) {
            if (!judgeTotal[rating.judge_id]) judgeTotal[rating.judge_id] = 0;
            judgeTotal[rating.judge_id] += rating.rating;
        }
        for (let i=0;i<judgeTotal.length;i++) {
            // Theres problems if a judge rates all hacks zero
            if (judgeTotal[i] === 0) judgeTotal[i] = 1;
        }
        let hackRatingsDenormal = [];
        let hackJudges = [];
        for (let rating of ratings) {
            if (!hackRatingsDenormal[rating.hack_id]) hackRatingsDenormal[rating.hack_id] = 0;
            if (!hackJudges[rating.hack_id]) hackJudges[rating.hack_id] = 0;
            hackJudges[rating.hack_id]++;
            hackRatingsDenormal[rating.hack_id] += rating.rating / judgeTotal[rating.judge_id];
        }
        let hackRatings = [];
        for (let i=0;i<hackRatingsDenormal.length;i++) {
            if (!hackRatingsDenormal[i]) continue;
            hackRatings.push({
                hack: i,
                score: hackRatingsDenormal[i] / hackJudges[i]
            });
        }
        let hackSorted = hackRatings.sort(function (a,b) {
            return b.score-a.score;
        });
        updateTable($("#winnersTable"), [
            { name: "hack", heading: "Hack Id" },
            { name: "score", heading: "Hack Score" }],
            hackSorted);
    });
}

function log(txt) {
    let date = new Date();
    let lines = txt.split("\n");
    let msg = "";
    for (let line of lines) {
        msg += "["+(new Date()).toLocaleString() + "] " + line + "\n";
    }

    $("#log").val($("#log").val()+msg);
}

window.addEventListener("load", function () {
    if (localStorage.getItem("adminSecret")) {
        $("#adminSecret").val(localStorage.getItem("adminSecret"));
    }

    $("#queryJudgeButton").click(function () {
        if (!socket) return;
        log("Emitting list-judges");
        socket.emit("list-judges");
    });
    $("#queryHacksButton").click(function () {
        if (!socket) return;
        log("Emitting list-hacks");
        socket.emit("list-hacks");
    });
    $("#querySupersButton").click(function () {
        if (!socket) return;
        log("Emitting list-prizes");
        socket.emit("list-prizes");
    });

    $("#addJudgeButton").click(function () {
        if (!socket) return;
        log("Adding Judge");
        socket.emit("add-judge", {
            name: $("#judgeName").val(),
            email: $("#judgeEmail").val()
        });
    });
    $("#scrapeDevpostButton").click(function () {
        if (!socket) return;
        log("Scraping Devpost. This is known to hold up the server.");
        socket.emit("devpost-scrape", $("#devpostURL").val());
    });
    $("#queryWinnersButton").click(function () {
        if (!socket) return;
        log("Emitting list-ratings");
        socket.emit("list-ratings");
    });
});
