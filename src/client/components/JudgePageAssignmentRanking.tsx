import React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
  Button
} from "reactstrap";

import {RankingAssignment} from "../../shared/GetAssignmentRequestTypes";
import {RankingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";

export const JudgePageAssignmentRanking = (props: JudgePageAssignmentRankingProps) => (
  <div>
    <Card>
      <CardBody>
        <CardTitle>{`Rank favorite submissions for prize ${props.rankingAssignment.prizeName}`}</CardTitle>

        <ListGroup>
        <ListGroupItem
          tag="button"
          onClick={
            () => props.onAlterRankingAssignmentForm(f => ({topSubmissionIds: []}))
          }
        >
          {`RESET`}
        </ListGroupItem>
        {props.rankingAssignment.submissions.map(s => (
          <ListGroupItem
            key={s.id}
            tag="button"
            onClick={
              () => props.onAlterRankingAssignmentForm(f => {
                if (f.topSubmissionIds.indexOf(s.id) < 0 && f.topSubmissionIds.length < 3) {
                  return {topSubmissionIds: [...f.topSubmissionIds, s.id]}
                } else {
                  return f;
                }
              })
            }
          >
            {(j => j < 0 ? s.name : `(${j+1}) ${s.name}`)(props.rankingAssignmentForm.topSubmissionIds.indexOf(s.id))}
          </ListGroupItem>
        ))}
        </ListGroup>
      </CardBody>
    </Card>

    <Card>
      <CardBody>
      <Button
        style={{width: "100%"}}
        size="lg"
        onClick={() => props.onSubmit()}
        disabled={!validateForm(props.rankingAssignmentForm)}
      >
        {`Submit \u25B6`}
      </Button>
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

function validateForm(form: RankingAssignmentForm): boolean {
  return form.topSubmissionIds.length === 3;
}
