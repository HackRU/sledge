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
import {JudgePageAssignmentRating} from "./JudgePageAssignmentRating";
import {JudgePageAssignmentRanking} from "./JudgePageAssignmentRanking";
import {RatingAssignmentForm, RankingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";

import {ConnectionStatus} from "../JudgeTypes";
import {RatingAssignment, RankingAssignment} from "../../shared/GetAssignmentRequestTypes";

export const JudgePage = (props: JudgePageProps) => (
  <Container id="JudgePage">
    <HeaderWithConnectionStatus
      connectionStatus={props.connectionStatus}
    />

    {(() => {
      switch (props.subPage) {
        case "JUDGE_SUBPAGE_LOADING":
          return (<JudgePageLoading />);
        case "JUDGE_SUBPAGE_BAD_CREDENTIALS":
          return (<JudgePageBadCredentials onSegue={props.onSegue} />);
        case "JUDGE_SUBPAGE_SETUP":
          return (<JudgePageSetup />);
        case "JUDGE_SUBPAGE_ENDED":
          return (<JudgePageEnded />);
        case "JUDGE_SUBPAGE_ASSIGNMENT_RATING":
          return (
            <JudgePageAssignmentRating
              ratingAssignment={props.ratingAssignment}
              ratingAssignmentForm={props.ratingAssignmentForm}
              onAlterRatingAssignmentForm={props.onAlterRatingAssignmentForm}
              onSubmit={props.onSubmitRatingAssignmentForm}
            />
          );
        case "JUDGE_SUBPAGE_ASSIGNMENT_RANKING":
          return (
            <JudgePageAssignmentRanking
              rankingAssignment={props.rankingAssignment}
              rankingAssignmentForm={props.rankingAssignmentForm}
              onAlterRankingAssignmentForm={props.onAlterRankingAssignmentForm}
              onSubmit={props.onSubmitRankingAssignmentForm}
            />
          );
        default:
          throw new Error(`Unhandled Judge subpage ${props.subPage}`);
      }
    })()}
  </Container>
);

export interface JudgePageProps {
  connectionStatus: ConnectionStatus;
  subPage: string;

  ratingAssignment?: RatingAssignment;
  ratingAssignmentForm?: RatingAssignmentForm;
  onAlterRatingAssignmentForm?: (f: (o: RatingAssignmentForm) => RatingAssignmentForm) => void;
  onSubmitRatingAssignmentForm?: () => void;

  rankingAssignment?: RankingAssignment;
  rankingAssignmentForm?: RankingAssignmentForm;
  onAlterRankingAssignmentForm?: (f: (o: RankingAssignmentForm) => RankingAssignmentForm) => void;
  onSubmitRankingAssignmentForm?: () => void;

  onSegue: (to: string) => void;
}

const JudgePageLoading = () => (
  <div>
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
  </div>
);

const JudgePageBadCredentials = (props: {onSegue: (page: string) => void}) => (
  <div>
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
  </div>
);

const JudgePageSetup = () => (
  <div>
    <Card>
      <CardBody>
        <CardTitle>
          <h2>{`Hang Tight! Judging hasn't started yet.`}</h2>
        </CardTitle>
        <CardText>
          {`When judging begins this page will automatically bring you to your first assignment. In the meantime `+
            `listen to hackathon organizers for instructions`}
        </CardText>
      </CardBody>
    </Card>
  </div>
);

const JudgePageEnded = () => (
  <div>
    <Card>
      <CardBody>
        <CardTitle>
          <h2>{`Judging has ended.`}</h2>
        </CardTitle>
      </CardBody>
    </Card>
  </div>
);
