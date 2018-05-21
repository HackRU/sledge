import {createElement, Component} from "react";
import {render}                   from "react-dom";
import {Store, createStore}       from "redux";

import {SledgeClient}         from "lib/client/sledge.js";
import {JudgeApp}             from "lib/client/components/judgeapp.js";
import {JudgeStore, reducer}  from "lib/client/reducers/judgeapp.js"

let client : SledgeClient;
let store : Store<JudgeStore>;

export function init() {
  client = new SledgeClient({
    host: document.location.host
  });

  store = createStore(reducer);

  // TODO: Get code and userId from localStorage
  let secret = "TEST";
  let userId = 1;

  // Update the store whenever sledge has updates
  client.subscribe(evt => {
    console.log(evt);
    store.dispatch({
      type: "DATABASE_UPDATE",
      database: client.getData()
    });
  });

  // For Debugging
  client.subscribe(evt => {
    console.log(evt);
  });

  // Immediately Authenticate and start recieving updates
  client.emitAuthenticate({secret, userId});
  client.emitSubscribeDatabase();

  let container = document.getElementById("app");
  let topElement = createElement(JudgeAppWrapper, null)
  render(topElement, container);
}

class JudgeAppWrapper extends Component<{}, JudgeStore> {
  constructor(props : {}) {
    super(props);

    this.state = store.getState();

    store.subscribe(this.refreshState);
  }

  public refreshState = () => {
    let newState = store.getState();
    this.setState( oldState => newState );
  }

  render() {
    return createElement(JudgeApp, {
      ...this.state,
      dispatch: store.dispatch
    });
  }
}
