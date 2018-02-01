(function () {
"use strict";

var e = React.createElement;

class Project extends React.Component {
    getNameAndLocation() {
        return this.props.name + " (@"+this.props.location+")";
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

window.judge.Project = Project;

})();
