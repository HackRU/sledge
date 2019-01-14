import React from "react";

import {
  SynchronizeGlobal
} from "../../protocol/events";

import {
  Container,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from "reactstrap";

import {
  SledgeClient,
  SledgeStatus
} from "../SledgeClient";

import {
  getSession,
  setSession
} from "../session";

export class LoginApp extends React.Component<{}, State> {
  sledge: SledgeClient;

  constructor(props: any) {
    super(props);

    let session = getSession();

    this.state = {
      synced: false,
      disconnected: false,
      judgeId: session.judgeId || 0
    };

    this.sledge = new SledgeClient({
      host: document.location.host
    });

    this.sledge.subscribeStatus(s => {
      if (s === SledgeStatus.Disconnected) {
        this.setState({
          disconnected: true
        });
      }
    });

    this.sledge.subscribeSyncGlobal(evt => {
      this.setState({
        synced: true,
        lastSync: evt
      });
    });

    this.sledge.sendSetSynchronizeGlobal({
      syncShared: true
    });
  }

  render() {
    return (
      <Container>
        <ListGroup>
          <ListGroupItem color={this.state.disconnected ? "danger" : "info"}>
            <ListGroupItemHeading>{`Login to Sledge`}</ListGroupItemHeading>
            <ListGroupItemText>{this.infoText()}</ListGroupItemText>
          </ListGroupItem>
          <ListGroupItem>
            <ListGroupItemText>
              {` You are currently logged in as `}<b>{this.currentJudgeName()}</b>{`.`}
            </ListGroupItemText>
          </ListGroupItem>
          {
            (!this.state.disconnected && this.state.synced) ? this.judgesList() : []
          }
        </ListGroup>
      </Container>
    );
  }

  currentJudgeName(): string {
    if (!this.state.synced) {
      return "Loading...";
    }

    let judge = this.state.lastSync.judges.find(j => j.id === this.state.judgeId);
    if (!judge) {
      return "Not Logged In";
    } else {
      return judge.name;
    }
  }

  infoText(): JSX.Element {
    if (this.state.disconnected) {
      return (
        <span>{`You have been disconnected from Sledge. Please refresh.`}</span>
      );
    } else if (this.state.synced) {
      return (
        <span>{`Use this page to log in.`}</span>
      );
    } else {
      return (
        <span>{`Loading...`}</span>
      );
    }
  }

  judgesList(): Array<JSX.Element> {
    return this.state.lastSync.judges.sort(
      (a,b) => a.id - b.id
    ).map(j => (
      <ListGroupItem
        key={j.id}
        tag="button"
        onClick={() => this.selectJudge(j.id)}
      >{j.name}
      </ListGroupItem>
    ));
  }

  selectJudge(judgeId: number) {
    this.sledge.sendLogin({
      judgeId,
      loginCode: "0000"
    }).then(res => {
      if (!res.success) {
        alert(res.message);
        return;
      }

      localStorage.setItem("secret", res.secret);
      localStorage.setItem("judgeId", res.judgeId.toString(10));
      window.location.hash = "#judge";
    });
  }
}

interface State {
  synced: boolean;
  disconnected: boolean;
  lastSync?: SynchronizeGlobal;
  judgeId: number
}
