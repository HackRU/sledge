(function () {
    initSocket({token: 'test'});

    var currentHackId = -1;

    function updateUI() {
        let state = getSledgeState();

        if ( currentHackId < 0 && state.hacks.length > 1 )
            currentHackId = 1;

        let currentHack = {
            id: -1,
            name: "[No Hacks Found]",
            location: "[No Hacks Found]",
            description: "[No Hacks Found]",
            view: 0
        };
        if ( currentHackId > 0 ) {
            currentHack = state.hacks[currentHackId];
        }

        // Current Hack
        $("#hackLocation").text(currentHack.location);
        $("#hackDescription").text(currentHack.description);
        $("#hackName").text(currentHack.name);

        // Buttons
        if ( currentHackId + 1 < state.hacks.length ) {
            $("#nextHackButton").parent().removeClass("disabled");
        } else {
            $("#nextHackButton").parent().addClass("disabled");
        }

        if ( currentHackId  >= 2 ) {
            $("#prevHackButton").parent().removeClass("disabled");
        } else {
            $("#prevHackButton").parent().addClass("disabled");
        }

        // Hack Dropdown
        $("#hackMenu").html("");
        for (hack of state.hacks) {
            if (!hack) continue;

            let li = document.createElement("li");
            let a  = document.createElement("a");
            a.href = "javascript: void(0);";
            $(a).text(hack.name);
            li.appendChild(a);
            $("#hackMenu").append(li);

            $(a).click( ((hack, evt) => {
                currentHackId = hack.id;
                updateUI();
            }).bind(null, hack) );
        }
    }
    window.updateUI = updateUI;

    function init() {
        $("#prevHackButton").click(function () {
            if ( currentHackId >= 2 ) {
                judgeState.currentHack--;
            }

            updateUI();
        });
        $("#nextHackButton").click(function () {
            if ( judgeState.currentHack + 1 < judgeState.hacks.length ) {
                judgeState.currentHack++;
            }

            updateUI();
        });

        notifyOnUpdate(updateUI);

        updateUI();
    }
    //window.addEventListener("load", init);
})();
