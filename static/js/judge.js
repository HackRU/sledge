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
    constructor(props) {
        super(props);

        sledge.subscribe(data => {
            if ( !data.trans && sledge.isInitialized() )
                this.updateSledgeData();
        });

        this.state = {
            judgeHacks: [],
            currentHackPos: -1,
            judge: {
                id: 0,
                name: "[Judge not found]",
                email: "notfound@example.com"
            }
        };

        if ( sledge.isInitialized() )
            this.updateSledgeData();
    }

    updateSledgeData() {
        this.setState( (prevState, props) => {
            let currentHackPos = prevState.currentHackPos;
            let judge = sledge.getJudgeInfo(1);
            let judgeHacks = sledge.getJudgeHacks(1); // TODO: What judge?

            if ( currentHackPos < 0 && judgeHacks.length > 0 )
                currentHackPos = 0;

            return {
                judge,
                judgeHacks,
                currentHackPos
            };
        });
    }

    render() {
        let currentHack = this.getCurrentHack();

        return e("div", { className: "container d-flex judge-container" },
            e(Toolbar, {
                onPrev: () => {
                    this.setState( (prevState, props) => {
                        if ( prevState.currentHackPos-1 >= 0 )
                            return { currentHackPos: prevState.currentHackPos-1 };
                        else
                            return {};
                    });
                },
                onList: () => {},
                onNext: () => {
                    this.setState( (prevState, props) => {
                        if ( prevState.currentHackPos+1 < prevState.judgeHacks.length )
                            return { currentHackPos: prevState.currentHackPos+1 };
                        else
                            return {};
                    });
                },
            }),
            e(JudgeInfo, {
                name: this.state.judge.name
            }),
            e(Project, {
                name: currentHack.name,
                description: currentHack.description,
                location: currentHack.location
            }),
            e(RatingBox, {
                chosen: 1,
                onSubmit: () => {}
            }),
            e(Superlatives, null)
        );
    }

    getCurrentHack() {
        if ( this.state.currentHackPos < 0 ) {
            return {
                name: "[No Hacks Found]",
                description: "[No Hacks Found]",
                location: "?",
            }
        } else {
            return this.state.judgeHacks[this.state.currentHackPos];
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
                e("button", {
                    className: "btn btn-primary toolbar-prev",
                    onClick: this.props.onPrev
                }, "<--"),
                e("button", {
                    className: "btn btn-primary toolbar-list",
                    onClick: this.props.onList
                }, "LIST"),
                e("button", {
                    className: "btn btn-primary toolbar-next",
                    onClick: this.props.onNext
                }, "-->") )
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

class JudgeInfo extends React.Component {
    render() {
        return e("div", { className: "judgeinfo-comp" },
            e("span", null,
                e("span", null, "Hello, "),
                e("span", { className: "judgeinfo-name" }, this.props.name),
                e("span", null, "!") )
        );
    }
}

class RatingBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: props.chosen
        };
    }

    select(i) {
        this.setState({
            selected: i
        });
    }

    resetSelect() {
        this.setState({
            selected: this.props.chosen
        });
    }

    buttonGroup(a, b) {
        let buttons = [];
        for (let i=a;i<b;i++) {
            let classes = "btn btn-secondary";
            if ( i === 1 )  classes += " ratingbox-top-left";
            if ( i === 20 ) classes += " ratingbox-bottom-right";
            if ( this.state.selected === i ) classes += " ratingbox-selected";
            if ( this.props.chosen === i ) classes += " ratingbox-chosen";

            buttons.push(
                e("button", { className: classes, onClick: () => this.select(i) },
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
                this.buttonGroup(11, 21),
                e("div", { className: "btn-group" },
                    e("button", { className: "btn", onClick: () => this.resetSelect() },
                        "RESET"),
                    e("button", {
                        className: "btn ratingbox-bottom-right",
                        onClick: () => this.props.onSubmit( this.state.selected )
                    }, "SUBMIT") ))
        );
    }
}

class Superlatives extends React.Component {
    render() {
        return e("div", null, "Superlatives");
    }
}

})();
