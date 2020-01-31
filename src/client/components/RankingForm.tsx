import React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
  Button
} from "reactstrap";

export const RankingForm = (props: RankingFormProps) => (
  <form onSubmit={e => {e.preventDefault()}}>
    <Card>
      <CardBody>
        <CardTitle>
          {`Rank your favorite submissions for "${props.prizeName}"`}
        </CardTitle>

        <ListGroup>
          <ListGroupItem
            tag="button"
            onClick={props.onClear}
          >
            {`CLEAR`}
          </ListGroupItem>
          {props.submissions.map((s, i) => (
            <RankSubmissionItem
              key={i}
              rank={s.rank}
              submissionName={s.name}
              disabled={!props.canRankMore || s.rank > 0}
              onSelect={() => props.onSelectSubmission(i)}
            />
          ))}
        </ListGroup>
      </CardBody>
    </Card>

    <Card>
      <CardBody>
        <Button
          style={{width: "100%"}}
          size="lg"
          onClick={props.onSubmit}
          disabled={!props.canSubmit}
          type="button"
        >
          {`SUBMIT \u25B6`}
        </Button>
      </CardBody>
    </Card>
  </form>
);

const RankSubmissionItem = (props: {
  rank: number,
  disabled: boolean,
  submissionName: string,
  onSelect: () => void
}) => (
  <ListGroupItem
    tag="button"
    onClick={props.onSelect}
    disabled={props.disabled}
  >
    {props.rank > 0 ? `[${props.rank}] ${props.submissionName}` : props.submissionName}
  </ListGroupItem>
);

export interface RankingFormProps {
  prizeName: string;
  submissions: Array<{
    name: string,
    rank: number
  }>;
  canRankMore: boolean;
  canSubmit: boolean;

  onSelectSubmission: (index: number) => void;
  onClear: () => void;
  onSubmit: () => void;
}
