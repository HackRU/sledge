(function () {
"use strict";
//model
//TODO db integration for changing scores
var Projects = {
  projects: [],
  new(project) {
    //TODO db integration and auth
    this.projects.push(project);
  },
  named(name) {

    //TODO lookup from db not array
    return this.projects.filter(project => {
      return project.name == name;
    });
  },
  firstNamed(name) {
    return this.named(name)[0];
  },
  all() {
    //TODO lookup in db not array
    return this.projects;
  },
  successor(name) {
    //TODO implement vEB tree
    var index = this.projects.findIndex(project => {
      return project.name == name;
    });
    //TODO better error Handling
    if (index == -1 || index + 1 == this.projects.length) throw "no more projects, or no project named " + name;else return this.projects[index + 1];
  },
  predecessor(name) {
    //TODO implement vEB tree
    var index = this.projects.findIndex(project => {
      return project.name == name;
    });
    //TODO better error Handling
    if (index == -1 || index - 1 == -1) throw "no more projects, or no project named " + name;else return this.projects[index - 1];
  },
  setScore(name, value) {
    this.firstNamed(name).score = value;
  }
};
class Project {
  constructor(name, description) {
    this.name = name;
    this.score = 1;
    this.description = description;
    Projects.new(this);
  }
  setScore(score) {
    //TODO beter error handling
    if (score >= 0 && score <= 20) {
      this.score = score;
      Projects.setScore(this.name, score);
    } else alert("bad score");
  }
}

function makeTestData() {
  new Project("lmaoizer", "turns strings into funny memes");
  new Project("meme space", "a place to share funny memes");
  new Project("reddit clone", "yet another 4chan clone");
  new Project("hobble", "gets data from hubble api very slowly");
  new Project("my first project", "my first time coding in html");
  new Project("sledge", "honestly it should qualify as a hack ru hack");
  new Project("corn beef me", "uses twilio to control a robotic arm that will make a cornbeef sandwitch and throw it  at you really hard");
}
//end model

//project list component
class ProjectListElement extends React.Component {
  render() {
    return React.createElement(
      "li",
      { className: "list-group-item", onClick: this.props.onClick },
      React.createElement(
        "h4",
        null,
        this.props.name,
        " - ",
        this.props.score
      )
    );
  }
}
//end project list component

//project list component

class ProjectList extends React.Component {
  projectSelect(name) {
    //theres probably a better way to do this
    var self = this;
    return function () {
      self.props.projectSelectHandler(name);
    };
  }
  render() {
    return React.createElement(
      "ul",
      { className: "list-group" },
      this.props.projects.map(project => {
        return React.createElement(ProjectListElement, { onClick: this.projectSelect(project.name), name: project.name, score: project.score });
      })
    );
  }
}
//end project list component

//score button component
class ScoreButton extends React.Component {
  //requires 
  render() {
    var myClass = "btn ";
    if (this.props.current) myClass += "btn-primary";else myClass += "btn-secondary";
    return React.createElement(
      "button",
      {
        className: myClass,
        onClick: this.props.handler },
      this.props.number
    );
  }
}
//end score button component

//score component
class Score extends React.Component {
  scoreButtons(a, b) {
    var nums = [];
    for (var i = a; i <= b; i++) nums[i] = i;
    return nums.map(i => {
      return React.createElement(ScoreButton, {
        number: i,
        handler: this.scoreButtonHandler(i),
        current: this.props.score == i });
    });
  }
  scoreButtonHandler(i) {
    return () => {
      this.props.setScore(i);
    };
  }
  render() {
    return React.createElement(
      "div",
      { className: "btn-toolbar", role: "toolbar" },
      React.createElement(
        "span",
        { className: "btn-group", role: "group" },
        this.scoreButtons(1, 11)
      ),
      React.createElement(
        "span",
        { className: "btn-group", role: "group" },
        this.scoreButtons(12, 20)
      )
    );
  }
}
//end score component

//focused project
class FocusedProject extends React.Component {
  setScore(i) {
    this.props.setScore(i);
  }
  render() {
    return React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-4" },
        this.props.project.name
      ),
      React.createElement(
        "p",
        { className: "lead" },
        this.props.project.description
      ),
      React.createElement("hr", null),
      React.createElement(Score, { score: this.props.project.score, setScore: this.setScore.bind(this) })
    );
  }
}
//end focused project

//toolbar component
class ToolBar extends React.Component {
  handle(event) {
    return () => {
      this.props.toolBarHandler(event);
    };
  }
  render() {
    //bg faded dosn't work for some reason
    return React.createElement(
      "div",
      { className: "bg-faded container-fluid" },
      React.createElement(
        "span",
        { className: "btn-group row", role: "group" },
        React.createElement(
          "button",
          {
            className: "btn btn-secondary",
            onClick: this.handle("previous").bind(this) },
          "previous"
        ),
        React.createElement(
          "button",
          {
            className: "btn btn-secondary",
            onClick: this.handle("next").bind(this) },
          "next"
        ),
        React.createElement(
          "button",
          {
            className: "btn btn-secondary",
            onClick: this.handle("list").bind(this) },
          "list"
        )
      )
    );
  }
}
//end toolbar component

//app component
class App extends React.Component {
  constructor() {
    super();
    //TODO open DB connection
    makeTestData();
    this.state = {
      focusedProject: Projects.all()[0],
      projects: Projects.all(),
      focused: true
    };
  }
  //TODO depricated
  pop() {
    Projects.firstNamed("lmaoizer").setScore(3);
    this.setState({ projects: Projects.all() });
  }
  projectSelectHandler(name) {
    this.setState({ focusedProject: Projects.firstNamed(name) });
    if (!this.state.focused) this.setState({ focused: true });
  }
  toolBarHandler(event) {
    switch (event) {
      case "list":
        this.setState({ focused: !this.state.focused });
        break;
      case "next":
        try {
          var next = Projects.successor(this.state.focusedProject.name);
          this.setState({ focusedProject: next });
        } catch (e) {/*not a bug, its a feature*/}
        break;
      case "previous":
        try {
          var previous = Projects.predecessor(this.state.focusedProject.name);
          this.setState({ focusedProject: previous });
        } catch (e) {/*not a bug, its a feature*/}
        break;
    }
  }
  setScore(i) {
    var name = this.state.focusedProject.name;
    console.log(name);
    Projects.setScore(name, i);
    console.log(i);
    this.setState({ focusedProject: Projects.firstNamed(name) });
  }
  focusedItem() {
    if (this.state.focused) {
      return React.createElement(FocusedProject, {
        project: this.state.focusedProject,
        setScore: this.setScore.bind(this) });
    } else {
      return React.createElement(ProjectList, {
        projectSelectHandler: this.projectSelectHandler.bind(this),
        projects: this.state.projects });
    }
  }
  render() {
    return React.createElement(
      "div",
      { className: "container" },
      React.createElement(ToolBar, { toolBarHandler: this.toolBarHandler.bind(this) }),
      this.focusedItem()
    );
  }
}
//end app component

React.render(React.createElement(App, null), window.document.getElementById("app"));
})();
