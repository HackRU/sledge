import * as React           from "react";
import * as ReactDOM        from "react-dom";
import {Store, createStore} from "redux";

import {SledgeClient}   from "lib/client/sledge.js";
import {JudgeApp}       from "lib/client/components/judgeapp.js";
import {JudgeStore}     from "lib/client/reducers/judgeapp.js"

let client : SledgeClient;
let store : Store<JudgeStore>;

export function init() {
  client = new SledgeClient({
    host: document.location.host
  });

  // TODO: Get code and userId from localStorage
  let secret = "TEST";
  let userId = 1;

  // Update the store whenever sledge has updates
  client.subscribe(evt => {
    store.dispatch({
      type: "DATABASE_UPDATE",
      database: client.getData()
    });
  });

  // Immediately Authenticate and start recieving updates
  client.emitAuthenticate({secret, userId});
  client.emitSubscribeDatabase({});

  let container = document.getElementById("app");
  let topElement = React.createElement(JudgeAppWrapper, null)
  ReactDOM.render(topElement, container);
}

class JudgeAppWrapper extends React.Component<{}, JudgeStore> {
  constructor() {
    super({});

    this.state = store.getState();

    store.subscribe(this.refreshState);
  }

  public refreshState = () => {
    let newState = store.getState();
    this.setState( oldState => newState );
  }

  render() {
    return React.createElement(JudgeApp, {
      ...this.state,
      dispatch: store.dispatch
    });
  }
}
