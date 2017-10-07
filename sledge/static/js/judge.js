(function () {
"use strict";

initSocket({token: 'test'});

var currentHack = {
        id: -1,
        name: "[No Hacks Found]",
        location: "[No Hacks Found]",
        description: "[No Hacks Found]",
        view: 0
};
var state = null;

function updateUI() {
    updateCurrentHack();
    updatePrevNextButtons();
    updateHacksDropdown();
}

function updateCurrentHack() {
    if ( currentHack.id < 0 && state.myTotalHacks > 0 )
        currentHack = state.myHacks[0];

    // Current Hack
    $(".hack-name").text(currentHack.name);
    $(".hack-location").text(currentHack.location);
    $(".hack-description").text(currentHack.description);
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
    $("#hackMenu").html("");
    for (let hack of state.myHacks) {
        let li = document.createElement("li");
        let a  = document.createElement("a");
        a.href = "javascript: void(0);";
        $(a).text(hack.name);
        li.appendChild(a);
        $("#hackMenu").append(li);

        $(a).click( ((hack, evt) => {
            currentHack = state.hacks[hack.id];
            updateUI();
        }).bind(null, hack) );
    }
}
window.updateUI = updateUI;

function gotoRelativeHack(n) {
    if ( state.myTotalHacks <= 0 )
        return false;

    let pos = state.myHackPositions[currentHack.id];

    if ( pos+n >= 0 && pos+n < myTotalHacks ) {
        currentHack = state.myHackPositions[pos+n];
        return true;
    }
    return false;
}

function init() {
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

    updateUI();

    sendListJudges();
    sendListHacks();
}
window.addEventListener("load", init);

function getStateSummary() {
    return {
        currentHack,
        state
    };
}
window.getStateSummary = getStateSummary;
})();
