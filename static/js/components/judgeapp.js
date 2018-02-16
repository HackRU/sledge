(function () {
"use strict";

var e = React.createElement;

class JudgeApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.updateStateFromProps(null, props);
    }

    componentWillReceiveProps(nextProps) {
        let updatedState = this.updateStateFromProps(this.state, nextProps);
        if ( updatedState !== this.state ) {
            this.setState(updatedState);
        }
    }

    updateStateFromProps(state, props) {
        if ( state === null || state.currentHackId < 0 ) {
            if ( props.hackOrdering.length > 0 ) {
                return {
                    currentHackId: props.hackOrdering[0]
                };
            } else {
                return {
                    currentHackId: -1
                };
            }
        } else {
            return state;
        }
    }

    getCurrentHack() {
        if ( this.state.currentHackId < 0 ) {
            return {
                id: 0,
                name: "[No Hacks Found]",
                description: "[No Hacks Found]",
                location: "?",
            }
        } else {
            return this.props.hacks[this.state.currentHackId];
        }
    }


    getNextHackId() {
        let pos = this.props.hackPositions[this.state.currentHackId];
        if ( pos+1 >= this.props.hackOrdering.length ) {
            return null;
        } else {
            return this.props.hackOrdering[pos+1];
        }
    }

    getPrevHackId() {
        let pos = this.props.hackPositions[this.state.currentHackId];
        if ( pos-1 < 0 ) {
            return null;
        } else {
            return this.props.hackOrdering[pos-1];
        }
    }

    ////////////////////
    // Rendering

    getToolbarProps() {
        let prevHackId = this.getPrevHackId();
        let nextHackId = this.getNextHackId();

        return {
            onPrev: () => {
                if (prevHackId) this.setState({currentHackId: prevHackId});
            },
            onList: () => {},
            onNext: () => {
                if (nextHackId) this.setState({currentHackId: nextHackId});
            }
        };
    }

    getJudgeProps() {
        return this.props.judgeInfo;
    }

    getProjectProps() {
        return this.getCurrentHack();
    }

    getRatingBoxProps() {
        return {
            chosen: this.props.ratings[this.state.currentHackId],
            hackId: this.state.currentHackId,
            onSubmit: r => sledge.sendRateHack({
                judgeId: this.props.myJudgeId,
                hackId: this.state.currentHackId,
                rating: r
            }),
        };
    }

    getSuperlativeProps() {
        let supers = this.props.superlatives.map( s => ({
            name: s.name,
            id: s.id,
            chosenFirstId: this.props.chosenSuperlatives[s.id].first,
            chosenSecondId: this.props.chosenSuperlatives[s.id].second
        }));

        return {
            superlatives: supers,
            hacks: this.props.hacks,
            currentHackId: this.state.currentHackId,
            onSubmit: (superId, choices) => {
                sledge.sendRankSuperlative({
                    judgeId: this.state.myJudgeId,
                    superlativeId: superId,
                    firstChoiceId: choices.first,
                    secondChoiceId: choices.second
                });
            }
        };
    }

    render() {
        let currentHack = this.getCurrentHack();

        return e("div", { className: "container d-flex judge-container" },
            e(judge.Toolbar, this.getToolbarProps()),
            e(judge.JudgeInfo, this.getJudgeProps()),
            e(judge.Project, this.getProjectProps()),
            e(judge.RatingBox, this.getRatingBoxProps()),
            e(judge.Superlatives, this.getSuperlativeProps())
        );
    }

}

window.judge.JudgeApp = JudgeApp;

})();
