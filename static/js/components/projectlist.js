(function () {
"use strict";

var e = React.createElement;

class ProjectList extends React.Component {
    createListItem(project){
	return e(window.judge.ProjectListElement, {projectName: project.pname})
    }
    render(){
	//TODO: get elements from db
	//TODO: actually add this component to main view
	//TODO: make list button switch to this view (modal)
	var elements=this.props.projects.map(this.createListItem)
	return e("div", {className: "list-view"},
	    e("ul", null,
	        elements));
    }
}

window.judge.ProjectList = ProjectList;

})();
