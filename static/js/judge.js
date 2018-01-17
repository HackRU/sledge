(function () {
"use strict";

// Since createElement is so commonly used, we use a shorthand
var e = React.createElement;

function init() {
    sledge.init();

    var appContainer = document.getElementById("app");
    ReactDOM.render(e(JudgeApp, null), appContainer);
}
window.addEventListener("load", init);

////////////////////
// Toplevel Judge Component

class JudgeApp extends React.Component {
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
        let currentHack = this.getCurrentHack();

        return e("div", { className: "container d-flex judge-container" },
            e(Toolbar, null),
            e(Project, {
                name: currentHack.name,
                description: currentHack.description,
                location: currentHack.location
            }),
            e(RatingBox, null),
            e(Superlatives, null)
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

////////////////////
// Child Components

class Toolbar extends React.Component {
    render() {
        return e("div", { className: "toolbar-comp" },
            e("div", { className: "toolbar-title" },
                e("h1", null,
                    "SLEDGE" ) ),
            e("div", { className: "btn-group toolbar-buttons" },
                e("button", { className: "btn btn-primary toolbar-prev" }, "<--"),
                e("button", { className: "btn btn-primary toolbar-list" }, "LIST"),
                e("button", { className: "btn btn-primary toolbar-next" }, "-->") )
        );
    }
}

class Project extends React.Component {
    getNameAndLocation() {
        return this.props.name + " (@"+this.props.location+")";
    }

    render() {
        return e("div", null,
            e("h2", { className: "project-title" },
                this.getNameAndLocation() ),
            e("p", { className: "project-description" },
                this.props.description )
        );
    }
}

class RatingBox extends React.Component {
    buttonGroup(a, b) {
        let buttons = [];
        for (let i=a;i<b;i++) {
            buttons.push(
                e("button", { className: "btn btn-secondary" },
                    i.toString() )
            );
        }

        return e("div", { className: "btn-group" },
            ...buttons
        );
    }

    render() {
        return e("div", { className: "ratingbox-comp" },
            e("div", { className: "btn-group-vertical" },
                this.buttonGroup( 1, 11),
                this.buttonGroup(11, 21) )
        );
    }
}

class Superlatives extends React.Component {
    render() {
        return e("div", null, "Superlatives");
    }
}

})();
