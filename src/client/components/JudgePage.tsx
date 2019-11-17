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
import {RatingAssignmentForm, RankingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";

import {RatingFormController} from "../components/RatingFormController";
import {RankingFormController} from "./RankingFormController";

import {ConnectionStatus} from "../JudgeTypes";
import {RatingAssignment, RankingAssignment} from "../../shared/GetAssignmentRequestTypes";

export const JudgePage = (props: JudgePageProps) => (
  <Container id="JudgePage">
    <HeaderWithConnectionStatus
      connectionStatus={props.connectionStatus}
    />

    <JudgeSubPage
      {...props}
    />
  </Container>
);

const JudgeSubPage = (props: JudgePageProps) => {
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
          assignmentId={props.assignmentId!}
          judgeName={props.judgeName!}
          ratingAssignment={props.ratingAssignment!}
          onSubmitRatingAssignment={props.onSubmitRatingAssignment!}
        />
      );
    case "JUDGE_SUBPAGE_ASSIGNMENT_RANKING":
      return (
        <JudgePageAssignmentRanking
          assignmentId={props.assignmentId!}
          judgeName={props.judgeName!}
          rankingAssignment={props.rankingAssignment!}
          onSubmitRankingAssignment={props.onSubmitRankingAssignment!}
        />
      );
    case "JUDGE_SUBPAGE_ASSIGNMENT_NONE":
      return (
        <JudgePageAssignmentNone />
      );
    default:
      throw new Error(`Unhandled Judge subpage ${props.subPage}`);
  }
};

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

const JudgePageAssignmentRating = (props: {
  assignmentId: number,
  judgeName: string,
  ratingAssignment: RatingAssignment,
  onSubmitRatingAssignment: (f: RatingAssignmentForm) => void
}) => (
  <div>
    <JudgeNameCard
      judgeName={props.judgeName}
    />

    <RatingFormController
      key={props.assignmentId}
      ratingAssignment={props.ratingAssignment}
      onSubmit={props.onSubmitRatingAssignment}
    />
  </div>
);

const JudgePageAssignmentRanking = (props: {
  assignmentId: number,
  judgeName: string,
  rankingAssignment: RankingAssignment,
  onSubmitRankingAssignment: (f: RankingAssignmentForm) => void
}) => (
  <div>
    <JudgeNameCard
      judgeName={props.judgeName}
    />

    <RankingFormController
      key={props.assignmentId}
      rankingAssignment={props.rankingAssignment}
      onSubmit={props.onSubmitRankingAssignment}
    />
  </div>
);

const JudgeNameCard = (props: {judgeName: string}) => (
  <Card>
    <CardBody>
      <CardText>
        {`Hello ${props.judgeName}!`}
      </CardText>
    </CardBody>
  </Card>
);

const JudgePageAssignmentNone = (props: {}) => (
  <Card>
    <CardBody>
      <CardText>
        <h2>{`No more assignments`}</h2>
      </CardText>
    </CardBody>
  </Card>
);

export interface JudgePageProps {
  subPage: string;
  connectionStatus: ConnectionStatus;

  judgeName?: string;
  assignmentId?: number;

  ratingAssignment?: RatingAssignment;
  onSubmitRatingAssignment?: (f: RatingAssignmentForm) => void;

  rankingAssignment?: RankingAssignment;
  onSubmitRankingAssignment?: (f: RankingAssignmentForm) => void;

  onSegue: (to: string) => void;
}
