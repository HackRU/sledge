(function () {
"use strict";

// Since createElement is so commonly used, we use a shorthand
var e = React.createElement;

function init() {
    sledge.init();

    var appContainer = document.getElementById("app");
    ReactDOM.render(e(App, null), appContainer);
}
window.addEventListener("load", init);

class App extends React.Component {
    constructor() {
        super();

        sledge.subscribe(data => {
            if ( !data.trans && sledge.isInitialized() )
                this.updateSledgeData();
        });

        this.state = {
            judgeHacks: [],
            currentHackId: 0,
        };

        if ( sledge.isInitialized() )
            this.updateSledgeData();
    }

    updateSledgeData() {
        this.setState({
            // TODO: Determine what judge we are
            judgeHacks: sledge.getJudgeHacks(1),
        });
    }

    render() {
        return e("div", { className: "container" },
            e(Toolbar, null),
            e(FocusedProject, { hack: this.getCurrentHack() })
        );
    }

    getCurrentHack() {
        if ( this.state.currentHackId === 0 ) {
            return {
                name: "[No Hacks Found]",
                description: "[No Hacks Found]",
                location: "?",
            }
        } else {
            return this.state.judgeHacks[this.state.currentHackId];
        }
    }
}

class FocusedProject extends React.Component {
    render() {
        return e("div", { className: "jumbotron" },
            e("h1", { className: "display-4" },
                this.props.name),
            e("p", { className: "lead" },
                this.props.description),
            e("hr", null),
            e(Score, { score: 1 })
        );
    }
}

class Score extends React.Component {
    render() {
        return e("div", { className: "btn-toolbar", role: "toolbar" },
            e("span", { className: "btn-group", role: "group" },
                this.scoreButtonGroup(0,  10),
                this.scoreButtonGroup(11, 20)
             ),
        )
    }

    scoreButtonGroup(start, end) {
        let buttons = [];
        for (let i=start;i<=end;i++) {
            buttons.push(
                e("button", { className: "btn" }),
                i.toString()
            )
        }

        return e("span", { className: "btn-group", role: "group" },
            ...buttons
        );
    }
}

class Toolbar extends React.Component {
    render() {
        return e("div", { className: "bg-faded container-fluid" },
            e("span", { className: "btn-group row", role: "group" },
                e("button", { className: "btn btn-secondary" }, "previous"),
                e("button", { className: "btn btn-secondary" }, "next"),
                e("button", { className: "btn btn-secondary" }, "list")
             )
        );
    }
}

})();
