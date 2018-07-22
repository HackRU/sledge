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

import {SledgeClient} from "../sledge.js";

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

    this.state = {
      initialized: false,
      hacks: []
    };
  }

  handleSync(data: Synchronize) {
    this.setState(prevState => {
      let newState = {
        initialized: true,
        hacks: prevState.hacks.slice(0)
      };

      for (let hack of data.hacks) {
        newState.hacks[hack.id] = hack;
      }
    });
  }

  render(): JSX.Element {
    return (
      <Container>
        <h1>{`Hack Locations`}</h1>
        { this.state.initialized ?
          this.renderTables() :
          this.renderWaiting() }
      </Container>
    );
  }

  renderWaiting(): JSX.Element {
    return (
      <div>
        <Alert color="secondary">
          {`Loading...`}
        </Alert>
      </div>
    );
  }

  renderTables(): JSX.Element {
    return (
      <div>
        <Alert color="success">
          {`If something changes this page will update automatically. `}
          {`Do not setup up until told by hackathon staff.`}
        </Alert>
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
      </div>
    );
  }
}

interface State {
  initialized: boolean;
  hacks: PartialTable<Hack>;
}
