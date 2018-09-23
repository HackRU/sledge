import React from "react";

import {
  Container,
  Table,
  Alert
} from "reactstrap";

import {
  SynchronizeGlobal as Synchronize
} from "../../protocol/events.js";

import {
  Hack,
  PartialTable
} from "../../protocol/database.js";

import {
  SledgeClient,
  SledgeStatus
} from "../sledge.js";

let sledge : SledgeClient;

export class TablesApp extends React.Component<{}, State> {
  constructor(props:any) {
    super(props);

    sledge = new SledgeClient({
      host: document.location.host
    });
    sledge.subscribeSyncGlobal(evt => {
      this.handleSync(evt);
    });
    sledge.sendSetSynchronizeGlobal({
      syncShared: true
    });
    sledge.subscribeStatus(s => {
      if (s === SledgeStatus.Disconnected) {
        this.setState({
          disconnected: true
        });
      }
    });

    this.state = {
      initialized: false,
      hacks: [],
      disconnected: false
    };
  }

  handleSync(data: Synchronize) {
    this.setState(prevState => {
      let newState = { ...prevState };
      newState.hacks = prevState.hacks.slice();
      newState.initialized = true;

      for (let hack of data.hacks) {
        newState.hacks[hack.id] = hack;
      }

      return newState;
    });
  }

  render(): JSX.Element {
    return (
      <Container>
        <h1>{`Hack Locations`}</h1>
        { this.renderBody() }
      </Container>
    );
  }

  renderBody(): JSX.Element {
    if (this.state.initialized) {
      return (
        <div>
          { this.renderAlert() }
          { this.renderTable() }
        </div>
      );
    } else {
      return (
        <div>
          { this.renderAlert() }
        </div>
      );
    }
  }

  renderAlert(): JSX.Element {
    if (this.state.disconnected && this.state.initialized) {
      return (
        <Alert color="danger">
          {`You have been disconnected from Sledge. Please check your internet connection.`}
        </Alert>
      );
    } else if (this.state.disconnected && !this.state.initialized) {
      return (
        <Alert color="danger">
          {`Unable to connect to Sledge. Please check your internet.`}
        </Alert>
      );
    } else if (!this.state.disconnected && this.state.initialized) {
      return (
        <Alert color="success">
          {`If something changes this page will update automatically. `}
          {`Do not setup up until told by hackathon staff.`}
        </Alert>
      );
    } else if (!this.state.disconnected && !this.state.initialized) {
      return (
        <Alert color="secondary">
          {`Loading...`}
        </Alert>
      );
    } else {
      throw new Error("Impossible else");
    }
  }

  renderTable(): JSX.Element {
    return (
      <Table hover>
        <thead>
          <tr>
            <th>{`Location`}</th>
            <th>{`Hack Name`}</th>
          </tr>
        </thead>
        <tbody>
          {this.state.hacks.filter(h => !!h).sort((h1,h2) => {
            if (h1.location !== h2.location) {
              return h1.location - h2.location;
            } else {
              return h1.id - h2.id;
            }
          }).map(h => (
            <tr key={h.id}>
              <th>{h.location}</th>
              <th>{h.name}</th>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
}

interface State {
  initialized: boolean;
  hacks: PartialTable<Hack>;
  disconnected: boolean;
}
