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
            },
            superlatives: [],
            chosenSuperlatives: [],
        };

        if ( sledge.isInitialized() )
            this.updateSledgeData();
    }

    updateSledgeData() {
        this.setState( (prevState, props) => {
            let hacks = sledge.getHacksTable();

            let currentHackPos = prevState.currentHackPos;
            let judge = sledge.getJudgeInfo(1);
            let judgeHacks = sledge.getJudgeHacks(1); // TODO: What judge?
            let superlatives = sledge.getSuperlatives();
            let chosenSuperlatives = sledge.getChosenSuperlatives(1);

            if ( currentHackPos < 0 && judgeHacks.length > 0 )
                currentHackPos = 0;

            return {
                hacks,

                judge,
                judgeHacks,
                currentHackPos,
                superlatives,
                chosenSuperlatives
            };
        });
    }

    calcSuperlatives() {
        return this.state.superlatives.map( s => ({
            name: s.name,
            id: s.id,
            chosenFirstId: this.state.chosenSuperlatives[s.id].first,
            chosenSecondId: this.state.chosenSuperlatives[s.id].second
        }));
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
            e(Superlatives, {
                superlatives: this.calcSuperlatives(),
                hacks: this.state.hacks,
                currentHackId: currentHack.id,
                onSubmit: (superId, choices) => {
                    sledge.rankSuperlative(1, superId, choices.first, choices.second)
                }
            })
        );
    }

    getCurrentHack() {
        if ( this.state.currentHackPos < 0 ) {
            return {
                id: 0,
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
        return e("div", { className: "project-comp" },
            e("h2", { className: "project-title" },
                this.getNameAndLocation() ),
            e("p", { className: "project-description" },
                this.props.description ),
            e("button", { className: "btn btn-primary project-noshow" },
                "Mark Hack as No Show" ),
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
                    e("button", { className: "btn ratingbox-border-right", onClick: () => this.resetSelect() },
                        "RESET"),
                    e("button", { className: "btn ratingbox-border-left ratingbox-border-right", onClick: () => {} },
                        "RUBRIC"),
                    e("button", {
                        className: "btn ratingbox-bottom-right ratingbox-border-left",
                        onClick: () => this.props.onSubmit( this.state.selected )
                    }, "SUBMIT") ))
        );
    }
}

class Superlatives extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: []
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState( (prevState, prevProps) => {
            let selected = prevState.selected.slice(0);

            for ( let superlative of nextProps.superlatives ) {
                if ( !selected[superlative.id] ) {
                    selected[superlative.id] = {
                        first: superlative.chosenFirstId,
                        second: superlative.chosenSecondId
                    };
                }
            }

            return { selected };
        });
    }

    superlativesList() {
        let superElems = [];
        for (let superlative of this.props.superlatives) {
            superElems.push( this.superlativeViewer(superlative) );
        }

        return e("div", null, ...superElems);
    }

    getHackName(def, id) {
        if ( id < 1 ) {
            return def;
        } else {
            return this.props.hacks[id].name;
        }
    }

    getSelectedFirstId(superlativeId) {
        if ( this.state.selected[superlativeId] ) {
            return this.state.selected[superlativeId].first;
        } else {
            return 0;
        }
    }

    getSelectedSecondId(superlativeId) {
        if ( this.state.selected[superlativeId] ) {
            return this.state.selected[superlativeId].second;
        } else {
            return 0;
        }
    }

    selectFirst(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);

            if ( props.currentHackId === selected[superlativeId].second ) {
                selected[superlativeId].second = selected[superlativeId].first;
                selected[superlativeId].first = props.currentHackId;
            } else if ( props.currentHackId !== selected[superlativeId].first ) {
                selected[superlativeId].second = selected[superlativeId].first;
                selected[superlativeId].first = props.currentHackId;
            }

            return { selected };
        });
    }

    selectSecond(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);

            if ( props.currentHackId === selected[superlativeId].first ) {
                selected[superlativeId].first = selected[superlativeId].second;
                selected[superlativeId].second = props.currentHackId;
            } else {
                selected[superlativeId].second = props.currentHackId;
            }

            return { selected };
        });
    }

    removeFirst(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            selected[superlativeId].first = selected[superlativeId].second;
            selected[superlativeId].second = 0;
            return { selected };
        });
    }

    removeSecond(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            selected[superlativeId].second = 0;
            return { selected };
        });
    }

    revert(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            let superlative = null;

            for (let s of props.superlatives) {
                if ( s.id === superlativeId ) superlative = s;
            }

            selected[superlativeId].first = superlative.chosenFirstId;
            selected[superlativeId].second = superlative.chosenSecondId;
        });
    }

    submit(superlativeId) {
        this.props.onSubmit(superlativeId, this.state.selected[superlativeId]);
    }

    superlativeViewer(s) {
        let selectedFirstId = this.getSelectedFirstId(s.id);
        let selectedSecondId = this.getSelectedSecondId(s.id);

        let selectedFirstName = this.getHackName("[NO FIRST PLACE]", selectedFirstId);
        let selectedSecondName = this.getHackName("[NO SECOND PLACE]", selectedSecondId);

        let dirtyFirstClass = (selectedFirstId === s.chosenFirstId)?"":" superlatives-dirty";
        let dirtySecondClass = (selectedSecondId === s.chosenSecondId)?"":" superlatives-dirty";

        return e("div", { className: "d-flex flex-column superlatives-item" },
            e("div", null,
                e("div", { className: "d-flex flex-row superlatives-info" },
                    e("div", { className: "superlatives-name" },
                        e("h3", null, s.name)),
                    e("div", { className: "superlatives-chosen" },
                        e("div", { className: "d-flex flex-column" },
                            e("div", { className: "superlatives-first"+dirtyFirstClass },
                                e("div", { className: "d-flex flex-row justify-content-end" },
                                    e("span", { className: "superlatives-hack" }, selectedFirstName),
                                    e("button", {
                                        className: "superlatives-remove",
                                        onClick: () => this.removeFirst(s.id)
                                    }, "X"))),
                            e("div", { className: "d-flex flex-row justify-content-end" },
                                e("div", { className: "superlatives-second"+dirtySecondClass },
                                    e("span", { className: "superlatives-hack" }, selectedSecondName),
                                    e("button", {
                                        className: "superlative-remove",
                                        onClick: () => this.removeSecond(s.id)
                                    }, "X"))))))),
            e("div", { className: "superlatives-actions" },
                e("div", { className: "btn-group" },
                    e("button", {
                        className: "btn superlatives-btn-first",
                        onClick: () => this.selectFirst(s.id)
                    }, "FIRST"),
                    e("button", {
                        className: "btn superlatives-btn-second",
                        onClick: () => this.selectSecond(s.id)
                    }, "SECOND"),
                    e("button", {
                        className: "btn superlatives-btn-revert",
                        onClick: () => this.revert(s.id)
                    }, "REVERT"),
                    e("button", {
                        className: "btn superlatives-btn-submit",
                        onClick: () => this.submit(s.id)
                    }, "SUBMIT")))
        );
    }

    render() {
        return e("div", { className: "superlatives-comp" },
            e("h2", null, "Superlatives"),
            e("div", { className: "superlatives-list" },
                this.superlativesList() )
        );
    }
}

})();
