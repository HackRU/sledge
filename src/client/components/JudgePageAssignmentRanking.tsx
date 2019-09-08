import React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem
} from "reactstrap";

import {RankingAssignment} from "../../shared/GetAssignmentRequestTypes";
import {RankingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";

export const JudgePageAssignmentRanking = (props: JudgePageAssignmentRankingProps) => (
  <div>
    <Card>
      <CardBody>
        <CardTitle>{`Rank favorite submissions for prize ${props.rankingAssignment.prizeName}`}</CardTitle>

        <ListGroup>
        {props.rankingAssignment.submissions.map(s => (
          <ListGroupItem
            key={s.id}
            tag="button"
            onClick={() => alert()}
          >
            {s.name}
          </ListGroupItem>
        ))}
        </ListGroup>
      </CardBody>
    </Card>
  </div>
);

export interface JudgePageAssignmentRankingProps {
  rankingAssignment: RankingAssignment;
  rankingAssignmentForm: RankingAssignmentForm;
  onAlterRankingAssignmentForm?: (f: (o: RankingAssignmentForm) => RankingAssignmentForm) => void;
  onSubmit: () => void;
};
