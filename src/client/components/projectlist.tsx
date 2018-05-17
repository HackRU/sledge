(function (comps) {
"use strict";

var e = React.createElement;

class ProjectList extends React.Component {
    createListItem(hack) {
	return e(ProjectListElement, {
	    projectName: hack.name,
	    rated: this.props.ratings[hack.id] !== 0,
	    updateHackId: () => this.props.setHackId(hack.id)
	});
    }
    render(){
	var elements=this.props.hackOrdering.map( hid =>
        this.createListItem(this.props.hacks[hid]) )
	return e("div", {className: "list-view"},
	    e("ul", null,
	        ...elements));
    }
}
comps.ProjectList = ProjectList;

class ProjectListElement extends React.Component {
    render(){
	let className="list-item btn-primary";
	if(this.props.rated){
	    className="list-item btn-success"
	}
	return e("li", {
	    className,
	    onClick: this.props.updateHackId
	    },
	    this.props.projectName
	);
    }
}
comps.ProjectListElement = ProjectListElement;

})(window.comps || (window.comps = {}));
