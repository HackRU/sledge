import React from "react";

import {
  Card,
  CardBody,
  CardTitle
} from "reactstrap";

import {RatingAssignment} from "../../shared/GetAssignmentRequestTypes";

export const JudgePageAssignmentRating = (props: JudgePageAssignmentRatingProps) => (
  <div>
    <Card>
      <CardBody>
        <CardTitle>
          <h2>
            {`Overall Rating: ${props.ratingAssignment.submissionName} `
              +`(table ${props.ratingAssignment.submissionLocation})`}
          </h2>
        </CardTitle>
      </CardBody>
    </Card>
  </div>
);

export interface JudgePageAssignmentRatingProps {
  ratingAssignment: RatingAssignment;
}
