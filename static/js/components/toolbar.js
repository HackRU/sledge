(function () {
"use strict";

var e = React.createElement;

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

window.judge.Toolbar = Toolbar;

})();
