(function () {
"use strict";

var e = React.createElement;

var judge = {};
window.judge = judge;

function init() {
    // TODO: Get Actual Token
    sledge.init({token: "test"});

    var appContainer = document.getElementById("app");
    ReactDOM.render(e(JudgeApp, null), appContainer);
}
judge.init = init;
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
            initialized: false,

            judgeHacks: [],
            ratings: [],
            currentHackPos: -1,
            judge: {
                id: 0,
                name: "[Judge not found]",
                email: "notfound@example.com"
            },
            superlatives: [],
            chosenSuperlatives: [],
            judgeId: 1 //TODO: What judge?
        };

        if ( sledge.isInitialized() )
            this.updateSledgeData();
    }

    updateSledgeData() {
        this.setState( (prevState, props) => {
            let hacks = sledge.getHacksTable();

            let currentHackPos = prevState.currentHackPos;
            let judge = sledge.getJudgeInfo(1);
            let judgeHacks = sledge.getJudgeHacks(this.state.judgeId);
            let superlatives = sledge.getSuperlatives();
            let chosenSuperlatives = sledge.getChosenSuperlatives(this.state.judgeId);
            let ratings = sledge.getJudgeRatings(this.state.judgeId);

            if ( currentHackPos < 0 && judgeHacks.length > 0 )
                currentHackPos = 0;

            return {
                initialized: true,
                hacks,

                judge,
                ratings,
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

    renderReady() {
        let currentHack = this.getCurrentHack();

        return e("div", { className: "container d-flex judge-container" },
            e(judge.Toolbar, {
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
            e(judge.JudgeInfo, {
                name: this.state.judge.name
            }),
            e(judge.Project, {
                name: currentHack.name,
                description: currentHack.description,
                location: currentHack.location
            }),
            e(judge.RatingBox, {
                chosen: this.state.ratings[currentHack.id],
                onSubmit: r => {
                    sledge.rateHack(this.state.judgeId, currentHack.id, r)
                },
                hackId: currentHack.id
            }),
            e(judge.Superlatives, {
                superlatives: this.calcSuperlatives(),
                hacks: this.state.hacks,
                currentHackId: currentHack.id,
                onSubmit: (superId, choices) => {
                    sledge.rankSuperlative(this.state.judgeId, superId, choices.first, choices.second)
                }
            })
        );
    }

    renderLoading() {
        return e("div", null,
            e("span", null, "Connecting to Sledge..."));
    }

    render() {
        if (this.state.initialized) {
            return this.renderReady();
        } else {
            return this.renderLoading();
        }
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
window.judge.JudgeApp = JudgeApp;

})();
