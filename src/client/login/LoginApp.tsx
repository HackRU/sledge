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

let sledge: SledgeClient;

export class LoginApp extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);

    let currentJudgeId = parseInt(localStorage.getItem("judgeId"));
    if (isNaN(currentJudgeId)) {
      currentJudgeId = 0;
    }

    console.log(currentJudgeId);

    this.state = {
      synced: false,
      disconnected: false,
      judgeId: currentJudgeId
    };

    sledge = new SledgeClient({
      host: document.location.host
    });

    sledge.subscribeStatus(s => {
      if (s === SledgeStatus.Disconnected) {
        this.setState({
          disconnected: true
        });
      }
    });
    sledge.subscribeSyncGlobal(evt => {
      this.setState({
        synced: true,
        lastSync: evt
      });
    });
    sledge.sendSetSynchronizeGlobal({
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
    sledge.sendLogin({
      judgeId,
      loginCode: "0000"
    }).then(res => {
      if (!res.success) {
        alert(res.message);
        return;
      }

      localStorage.setItem("secret", res.secret);
      localStorage.setItem("judgeId", res.judgeId.toString(10));
      document.location.href = "/judge.html";
      //document.location.reload();
    });
  }
}

interface State {
  synced: boolean;
  disconnected: boolean;
  lastSync?: SynchronizeGlobal;
  judgeId: number
}
