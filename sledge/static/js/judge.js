(function () {
    initSocket({token: 'test'});

    // Example Data
    var judgeState = {
        hackers: [{
            id: 0,
            email: "bilbo@reach.com",
            name: "Bilbo Baggins",
        }, {
            id: 1,
            email: "frodo@reach.com",
            name: "Frodo Baggins",
        }, {
            id: 2,
            email: "g@wizards.org",
            name: "Gandalf the Grey",
        }, {
            id: 3,
            email: "sauron@mordor.net",
            name: "Sauron"
        }],
        hacks: [{
            id: 0,
            name: "Tinder for Giraffes",
            loc: "Dark Allyway outside Student Center",
            authors: [0,1],
        }, {
            id: 1,
            name: "Tinder for Elephants",
            loc: "Underneath fourth row of tables",
            authors: [2],
        }, {
            id: 2,
            name: "One Ring",
            loc: "Row 4, Table 3",
            authors: [2,3],
        }],
        prizes: [{
            id: 0,
            name: "Best Solo",
        }, {
            id: 1,
            name: "Best Design",
        }],

        currentHack: 0,
    };

    function updateUI() {
        let state = judgeState;
        let currentHack = state.hacks[state.currentHack];

        // Current Hack
        $("#hackLocation").text(currentHack.loc);
        $("#hackDescription").text(currentHack.name);
        $("#hackName").text(currentHack.name);

        // Buttons
        if ( state.currentHack + 1 < judgeState.hacks.length ) {
            $("#nextHackButton").parent().removeClass("disabled");
        } else {
            $("#nextHackButton").parent().addClass("disabled");
        }

        if ( state.currentHack - 1 >= 0 ) {
            $("#prevHackButton").parent().removeClass("disabled");
        } else {
            $("#prevHackButton").parent().addClass("disabled");
        }

        // Authors
        $("#hackAuthors").text((() => {
            let hackers = "by ";

            if ( currentHack.authors.length <= 0 ) {
                return "by [nobody]";
            } else {
                for (let i=0;i<currentHack.authors.length;i++) {
                    hackers += state.hackers[currentHack.authors[i]].name;
                    if ( i+1 < currentHack.authors.length ) hackers += ", ";
                }
            }

            return hackers;
        })());

        // Hack Dropdown
        $("#hackMenu").html("");
        for (hack of state.hacks) {
            let li = document.createElement("li");
            let a  = document.createElement("a");
            a.href = "javascript: void(0);";
            $(a).text(hack.name);
            li.appendChild(a);
            $("#hackMenu").append(li);

            $(a).click( ((hack, evt) => {
                state.currentHack = hack.id;
                updateUI();
            }).bind(null, hack) );
        }
    }
    window.updateUI = updateUI;

    function init() {
        $("#prevHackButton").click(function () {
            if ( judgeState.currentHack - 1 >= 0 ) {
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

        updateUI();
    }
    window.addEventListener("load", init);
})();
