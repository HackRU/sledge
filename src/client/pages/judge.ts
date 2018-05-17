import * as React     from "react";
import * as ReactDOM  from "react-dom";

import * as sledge  from "../sledge.js";
import {JudgeApp}   from "../components/judgeapp.js";

var myJudgeId = null;

export function init() {
  let token = localStorage.getItem("token");
  let judgeId = parseInt(localStorage.getItem("judgeId"));

  if ( !token || isNaN(judgeId) ) {
    document.getElementById("app").appendChild(
    document.createTextNode("Bad token or Judge Id. Redirecting to login page..."));
  }

  sledge.init({token});

  myJudgeId = judgeId;

  var appContainer = document.getElementById("app");
  ReactDOM.render(
    React.createElement(
      JudgeAppWrapper, null), appContainer);
}

export function getSledgeData() {
    if (sledge.isInitialized()) {
        let hacks = sledge.getAllHacks();
        let judgeInfo = sledge.getJudgeInfo({
            judgeId: myJudgeId
        });
        let orderInfo = sledge.getHacksOrder({
            judgeId: myJudgeId
        });
        let superlatives = sledge.getSuperlatives();
        let chosenSuperlatives = sledge.getChosenSuperlatives({
            judgeId: myJudgeId
        });
        let ratings = sledge.getJudgeRatings({
            judgeId: myJudgeId
        });

        return {
            initialized: true,
            myJudgeId,

            hacks,
            judgeInfo,
            hackOrdering: orderInfo.order,
            hackPositions: orderInfo.positions,
            superlatives,
            chosenSuperlatives,
            ratings
        };
    } else {
        return {
            initialized: false
        };
    }
}

////////////////////
// Toplevel Component

export class JudgeAppWrapper extends React.Component {
  state : any;
    constructor(props) {
        super(props);

        this.state = {
            sledge: getSledgeData()
        };
    }

    componentDidMount() {
        sledge.subscribe(this.onUpdate.bind(this));
    }

    onUpdate(data) {
        if ( !data.trans && sledge.isInitialized() ) {
            this.setState({
                sledge: getSledgeData()
            });
        }
    }

    render() {
        if (this.state.sledge.initialized) {
            return React.createElement(
                    JudgeApp, this.state.sledge);
        } else {
            return React.createElement(
                    "span", null, "Loading...");
        }
    }
}
