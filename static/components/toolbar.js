(function (comps) {
"use strict";

var e = React.createElement;

class Toolbar extends React.Component {
    buttonClassName(disable) {
	if (disable) {
	    return  "btn btn-primary toolbar-prev disabled toolbar-no-text"
	} else {
	    return "btn btn-primary toolbar-prev"
	}
    }
    render() {
        return e("div", { className: "toolbar-comp" },
            e("div", { className: "toolbar-title" },
                e("h1", null,
                    "SLEDGE" ) ),
            e("div", { className: "btn-group toolbar-buttons"},
                e("button", {
                    className: this.buttonClassName(this.props.first),
                    onClick: this.props.onPrev
                }, "<--"),
                e("button", {
                    className: "btn btn-primary toolbar-list",
                    onClick: this.props.onList
                }, "LIST"),
                e("button", {
                    className: this.buttonClassName(this.props.last),
                    onClick: this.props.onNext
                }, "-->") )
        );
    }
}
comps.Toolbar = Toolbar;

})(window.comps || (window.comps = {}));
