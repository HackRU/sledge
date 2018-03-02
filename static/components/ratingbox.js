(function () {
"use strict";

var e = React.createElement;

class RatingBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // TODO: These should probably be loaded from somewhere
            categories: [{
                name: "Egregiousness",
                selected: -1,
                dirty: true,
                id: 0
            }, {
                name: "Homeliness",
                selected: -1,
                dirty: true,
                id: 1
            }, {
                name: "Abhorentness",
                selected: -1,
                dirty: true,
                id: 2
            }, {
                name: "Inoperativeness",
                selected: -1,
                dirty: true,
                id: 3
            }],

            noshow: false
        };
    }

    componentWillReceiveProps(newProps) {
        // TODO: Is there a better way to do this? Maybe we shouldn't
        //       be so reliant on stateful components?
        if ( this.props.hackId !== newProps.hackId ) {
            this.reset();
        }
    }

    reset() {
        this.setState( (prevState, props) => {
            let cats = prevState.categories.slice(0);
            for (let cat of cats) {
                cat.dirty = true;
                cat.selected = -1;
            }
            return { categories: cats };
        });
    }

    select(catId, score) {
        this.setState( (prevState, props) => {
            let cats = prevState.categories.slice(0);
            cats[catId].selected = score;
            cats[catId].dirty = true;
            return { categories: cats };
        });
    }

    submit() {
        let selected = this.getSelected();
        if (!selected.valid) return;

        this.setState( (prevState, props) => {
            let cats = prevState.categories.slice(0);
            for (let cat of cats) {
                cat.dirty = false;
            }
            return { categories: cats };
        });

        this.props.onSubmit(selected.total);
    }

    getSelected() {
        let total = 0;
        let valid = true;

        if ( this.state.noshow ) {
            return {
                total: -1,
                valid: true
            };
        }

        for (let cat of this.state.categories) {
            if ( cat.selected >= 0 ) {
                total += cat.selected;
            } else {
                valid = false;
            }
        }

        if ( total <= 0 || 20 < total )
            valid = false;

        return { total, valid };
    }

    renderCategory(cat) {
        let buttons = [];
        for (let i=0;i<6;i++) {
            let selectedClass = i==cat.selected?" ratingbox-selected":"";
            buttons.push(
                e("button", {
                    className: "btn"+selectedClass,
                    onClick: () => this.select(cat.id, i)
                }, i.toString())
            );
        }

        let dirtyClass = cat.dirty?" ratingbox-dirty":"";
        return e("div", { className: "ratingbox-category" },
            e("div", { className: "ratingbox-catname" },
                e("h3", null, cat.name)),
            e("div", { className: "btn-group"+dirtyClass },
                ...buttons)
        );
    }

    renderSelected() {
        let selected = this.getSelected();
        let validClass = toggleClass(selected.valid,
                "ratingbox-valid", "ratingbox-invalid");

        return e("span", {
            className: validClass
        }, selected.total>=0?selected.total.toString():"no show");
    }

    renderChosen() {
        let total = this.props.chosen;

        let totalString;
        if ( total > 0 ) {
            totalString = total.toString();
        } else if ( total < 0 ) {
            totalString = "no show";
        } else {
            totalString = "unrated";
        }

        return e("span", null, totalString);
    }

    render() {
        let cats = [];
        if (!this.state.noshow)
            cats = this.state.categories.map( c => this.renderCategory(c) );

        return e("div", { className: "ratingbox-comp" },
            e("div", null,
                e("div", { className: "ratingbox-noshow" },
                    e("button", {
                        className: "btn",
                        onClick: () => this.setState( (prevState, props) => ({ noshow: !prevState.noshow }) )
                    }, this.state.noshow?"Mark Hack as Present":"Mark Hack as No Show")),
                ...cats,
                e("div", { className: "ratingbox-summary" },
                    e("div", { className: "ratingbox-totalselected" },
                        e("span", null, this.renderSelected())),
                    e("div", { className: "ratingbox-totalchosen" },
                        e("span", null, this.renderChosen()))),
                e("div", { className: "ratingbox-submit" },
                    e("button", {
                        className: "btn",
                        onClick: () => this.submit()
                    }, "SUBMIT")))
        );
    }
}

window.judge.RatingBox = RatingBox;

})();
