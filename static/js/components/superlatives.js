(function () {
"use strict";

var e = React.createElement;

class Superlatives extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: []
        };

        for (let s of props.superlatives) {
            this.state.selected[s.id] = {
                first: s.chosenFirstId,
                second: s.chosenSecondId
            };
        }
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

    initSelected(selected, superlativeId) {
        if (!selected[superlativeId]) {
            selected[superlativeId] = {
                first: 0,
                second: 0
            };
        }
    }

    selectFirst(superlativeId) {
        this.setState( (prevState, props) => {
            let selected = prevState.selected.slice(0);
            this.initSelected(selected, superlativeId);

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
            this.initSelected(selected, superlativeId);

            if ( props.currentHackId === selected[superlativeId].first ) {
                selected[superlativeId].first = selected[superlativeId].second;
                selected[superlativeId].second = props.currentHackId;
            } else {
                selected[superlativeId].second = props.currentHackId;
            }

            if ( selected[superlativeId].first === 0 ) {
                selected[superlativeId].first = selected[superlativeId].second;
                selected[superlativeId].second = 0;
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

window.judge.Superlatives = Superlatives;

})();
