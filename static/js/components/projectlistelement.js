(function () {
"use strict";

var e = React.createElement;

class ProjectListElement extends React.Component {
    render(){
	return e("li", {className: "list-item"}, 
	    this.props.projectName);
    }
}

window.judge.ProjectListElement = ProjectListElement;

})();

