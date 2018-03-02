(function () {
"use strict";

var e = React.createElement;

class ProjectListElement extends React.Component {
    render(){
	return e("li", {
	    className: "list-item", 
	    onClick: this.props.updateHackId
	    }, 
	    this.props.projectName
	);
    }
}

window.judge.ProjectListElement = ProjectListElement;

})();

