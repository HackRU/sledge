(function (comps) {
"use strict";

var e = React.createElement;

class Project extends React.Component {
    getNameAndLocation() {
        return this.props.name + " (Position "+this.props.location+")";
    }

    render() {
        return e("div", { className: "project-comp" },
            e("h2", { className: "project-title" },
                this.getNameAndLocation() ),
            e("p", { className: "project-description" },
                this.props.description )
        );
    }
}
comps.Project = Project;

})(window.comps || (window.comps = {}));
