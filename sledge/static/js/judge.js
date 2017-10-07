(function () {
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
        if ( currentHack.id < 0 && state.totalHacks > 0 )
            currentHack = state.hacksAlphabetical[0];

        // Current Hack
        $(".hack-name").text(currentHack.name);
        $(".hack-location").text(currentHack.location);
        $(".hack-description").text(currentHack.description);
    }

    function updatePrevNextButtons() {
        let pos = -1;
        if ( state.totalHacks > 0 )
            pos = state.alphabetPosition[currentHack.id];

        if ( pos < state.totalHacks - 1 ) {
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
        for (hack of state.hacksAlphabetical) {
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
        if ( state.totalHacks <= 0 )
            return false;

        let pos = state.alphabetPosition[currentHack.id];

        if ( pos+n > 0 && pos+n < state.totalHacks ) {
            currentHack = state.hacksAlphabetical[pos+n];
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
