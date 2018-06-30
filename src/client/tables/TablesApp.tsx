import React from "react";

import {
  Container,
  Table,
  Alert
} from "reactstrap";

import {SynchronizeShared as Synchronize} from "../../protocol/events.js";
import {SledgeClient} from "../sledge.js";

let sledge : SledgeClient;

export class TablesApp extends React.Component<{}, {initialized:boolean, syncData:Synchronize}> {
  constructor(props:any) {
    super(props);

    sledge = new SledgeClient({
      host: document.location.host
    });
    sledge.subscribeSynchronize(evt => {
      this.handleSync(evt);
    });
    sledge.sendSetSynchronizeShared({
      syncShared: true
    });

    this.state = {
      initialized: false,
      syncData: undefined
    };
  }

  handleSync(data: Synchronize) {
    this.setState({
      initialized: true,
      syncData: data
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
            {this.state.syncData.hacks.sort((h1,h2) => {
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
