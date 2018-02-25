(function () {
"use strict";

var e = React.createElement;

class ProjectList extends React.Component {
    createListItem(hack) {
	return e(window.judge.ProjectListElement, {
	    projectName: hack.name, 
	    updateHackId: () => this.props.setHackId(hack.id)
	});
    }
    render(){
	//TODO: make list button switch to this view (modal)
	var elements=this.props.hacks.map(this.createListItem.bind(this))
	return e("div", {className: "list-view"},
	    e("ul", null,
	        ...elements));
    }
}

window.judge.ProjectList = ProjectList;

})();
