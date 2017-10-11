(function () {
"use strict";

var currentHack = {
        id: -1,
        name: "[No Hacks Found]",
        location: "[No Hacks Found]",
        description: "[No Hacks Found]",
        view: 0
};
var state = null;
var dropdown;
var ratings = [];
var ratingButtons = [];
var overallRating;

function updateUI() {
    updateCurrentHack();
    updatePrevNextButtons();
    updateHacksDropdown();
    updateOverallRating();
}
window.updateUI = updateUI;

function updateCurrentHack() {
    if ( currentHack.id < 0 && state.myTotalHacks > 0 )
        currentHack = state.myHacks[0];

    // Current Hack
    $(".hack-name").text(currentHack.name);
    $(".hack-location").text(currentHack.location);
    $(".hack-description").text(currentHack.description);

    // Judge Id
    $(".judge-id").text(state.myJudgeId);
}

function updatePrevNextButtons() {
    let pos = -1;
    if ( state.myTotalHacks > 0 )
        pos = state.myHackPositions[currentHack.id];

    if ( pos < state.myTotalHacks - 1 ) {
        $("#nextHackButton").parent().removeClass("disabled");
    } else {
        $("#nextHackButton").parent().addClass("disabled");
    }

    if ( pos > 0 ) {
        $("#prevHackButton").parent().removeClass("disabled");
    } else {
        $("#prevHackButton").parent().addClass("disabled");
    }
}

function updateHacksDropdown() {
    dropdown.html("");
    let def = dropdown.append(new Option(
        "[Select a Hack]", -1, false, false
    ));
    def.selected = true;
    for (let hack of state.myHacks) {
        let option = new Option(hack.name, hack.id, false, false);
        dropdown.append(option);
    }
    dropdown.val("-1");
    dropdown.trigger("change");
}

function updateOverallRating() {
    if (currentHack.id < 0) return;

    if ( !ratings[currentHack.id] ) ratings[currentHack.id] = [];
    for (let i=0;i<state.ratingCategories.length;i++) {
        if (typeof ratings[currentHack.id][i] != "number" ) {
            ratings[currentHack.id][i] = 0;
        }
    }

    for (let i=0;i<ratingButtons.length;i++) {
        for (let j=0;j<ratingButtons[i].length;j++) {
            if ( j == ratings[currentHack.id][i] )
                $(ratingButtons[i][j]).addClass("rating-selected");
            else
                $(ratingButtons[i][j]).removeClass("rating-selected");
        }
    }

    overallRating = ratings[currentHack.id].reduce( (x,y) => x+y, 0);

    $(".current-rating").text(overallRating.toString(10));
    $(".previous-rating").text(state.ratings[currentHack.id]===null?"None":state.ratings[currentHack.id].toString(10));
}

function gotoRelativeHack(n) {
    if ( state.myTotalHacks <= 0 )
        return false;

    let pos = state.myHackPositions[currentHack.id];

    if ( pos+n >= 0 && pos+n < state.myTotalHacks ) {
        currentHack = state.myHacks[pos+n];
        return true;
    }
    return false;
}

function init() {
    let judgeId = null;
    let token = null;
    document.location.search.substr(1).split("&").forEach( q => {
        let a = q.split("=");
        if ( a.length < 2 ) return;

        if (a[0] == "token") {
            try {
                token = decodeURIComponent(a[1]);
            } catch (e) {console.log("Bad URI Component! Ignoring silently.", a[1]);}
        } else if (a[0] == "judge") {
            judgeId = parseInt(decodeURIComponent(a[1]));
        }
    });
    if ( !judgeId || !token || isNaN(judgeId) ) {
        swal({
            title: "Invalid URL Parameters!",
            text: `We have detected the URL you are using to access this page contains an invalid token `+
                  `or Judge Id. Either your token "${token}" or Judge Id "${judgeId}" is invalid.\nPlease `+
                  `contact a sledge admin for assistance.`,
            icon: "error",
            button: {
                text: "Refresh",
                closeModal: false
            }
        }).then( () => window.location.reload() );
    }

    initSocket({
        token: token,
        isAdmin: false,
        judgeId: judgeId,
    });

    state = getSledgeState();

    $("#prevHackButton").click(function () {
        gotoRelativeHack(-1);
        updateUI();
    });
    $("#nextHackButton").click(function () {
        gotoRelativeHack(1);
        updateUI();
    });
    notifyOnUpdate(updateUI);

    dropdown = $("#hacksDropdown").select2({
        placeholder: "Select another Hack..."
    });
    dropdown.on("change", function (x) {
        let hackId = dropdown.val();
        if ( hackId && hackId > 0 ) {
            currentHack = state.hacks[dropdown.val()];
            updateCurrentHack();
            updatePrevNextButtons();
            updateOverallRating();
            dropdown.val("-1");
            dropdown.trigger("change");
        }
    });

    for (let i=0;i<state.ratingCategories.length;i++) {
        // TODO: Clean this up
        let category = state.ratingCategories[i];
        let div = document.createElement("div");
        let h6 = document.createElement("h6");
        $(h6).text(category.name);
        $(div).append(h6);
        let grp = document.createElement("div");
        $(grp).addClass("btn-group");
        $(grp).addClass("btn-group-justified");
        $(grp).addClass("rubric-category");
        let btns = [];
        for (let opt of category.possibilities) {
            let a = document.createElement("a");
            a.href = "javascript: void(0);";
            $(a).addClass("btn");
            $(a).addClass("btn-primary");
            $(a).text(opt.toString(10));
            $(grp).append(a);
            (function (opt, i) {
                $(a).on("click", function () {
                    if (currentHack.id < 0) return;
                    ratings[currentHack.id][i] = opt;
                    updateOverallRating();
                });
            })(opt, i);
            btns.push(a);
        }
        ratingButtons.push(btns);
        $(div).append(grp);
        $("#overallRatingCategories").append(div);
    }

    $("#ratingsSubmit").click(function (evt) {
        if (currentHack.id < 0) return;
        sendAddRating({
            judgeId: state.myJudgeId,
            hackId: currentHack.id,
            rating: overallRating
        });
    });

    updateUI();

    sendListJudges();
    sendListHacks();
    sendListRatings();
}
window.addEventListener("load", init);

function getStateSummary() {
    return {
        currentHack,
        state,
        dropdown,
        ratings,
    };
}
window.getStateSummary = getStateSummary;
})();
