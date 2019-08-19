import React from "react";

import {
  Container,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button
} from "reactstrap";

import {HeaderWithConnectionStatus} from "./HeaderWithConnectionStatus";

import {ConnectionStatus} from "../JudgeTypes";

export const JudgePage = (props: JudgePageProps) => (
  <Container id="JudgePage">
    <HeaderWithConnectionStatus
      connectionStatus={props.connectionStatus}
    />

    {(props.subPage === "JUDGE_SUBPAGE_LOADING") && (
      <Card>
        <CardBody>
          <CardTitle>
            <h2>{`Loading...`}</h2>
          </CardTitle>
          <CardText>
            {`If the circle up top turns yellow or red there's something wrong with your connection.`}
          </CardText>
        </CardBody>
      </Card>
    )}

    {(props.subPage === "JUDGE_SUBPAGE_BAD_CREDENTIALS") && (
      <Card>
        <CardBody>
          <CardTitle>
            <h2>{`You are not logged in.`}</h2>
          </CardTitle>
          <Button
            onClick={() => props.onSegue("#login")}
          >
            {`Go to Login Page`}
          </Button>
        </CardBody>
      </Card>
    )}

    {(props.subPage === "JUDGE_SUBPAGE_SETUP") && (
      <Card>
        <CardBody>
          <CardTitle>
            <h2>{`Hang Tight! Judging Hasn't started yet.`}</h2>
          </CardTitle>
          <CardText>
            {`When judging begins this page will automatically bring you to your first assignment. In the meantime `+
              `listen to hackathon organizers for instructions`}
          </CardText>
        </CardBody>
      </Card>
    )}

    {(props.subPage === "JUDGE_SUBPAGE_ENDED") && (
      <Card>
        <CardBody>
          <CardTitle>
            <h2>{`Judging has ended.`}</h2>
          </CardTitle>
        </CardBody>
      </Card>
    )}
  </Container>
);

export interface JudgePageProps {
  connectionStatus: ConnectionStatus;
  subPage: string;

  onSegue: (to: string) => void;
}
