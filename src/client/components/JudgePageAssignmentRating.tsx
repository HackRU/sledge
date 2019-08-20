import React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  ButtonGroup,
  Button
} from "reactstrap";
import {RadioButtonGroup} from "./RadioButtonGroup";

import {RatingAssignment} from "../../shared/GetAssignmentRequestTypes";
import {range} from "../../shared/util";

export const JudgePageAssignmentRating = (props: JudgePageAssignmentRatingProps) => (
  <div>
    <Card style={{margin: "15px 0px", padding: "10px"}}>
      <CardBody>
        <CardTitle>
          <h2>
            {`Overall Rating: ${props.ratingAssignment.submissionName} `
              +`(table ${props.ratingAssignment.submissionLocation})`}
          </h2>
        </CardTitle>
      </CardBody>
    </Card>

    <Card style={{margin: "15px 0px", padding: "10px"}}>
      <CardBody>
        <CardTitle>
          <h3>{`Did the submission show up?`}</h3>
        </CardTitle>
        <RadioButtonGroup
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 }
          ]}
          value={props.ratingAssignmentForm.noShow ? 1 : 0}
          onChange={newValue => props.onAlterRatingAssignmentForm(
            (form) => ({...form, noShow: !!newValue})
          )}
          size="lg"
        />
      </CardBody>
    </Card>

    <Card style={{margin: "15px 0px", padding: "10px"}}>
      {props.ratingAssignment.categories.map((c, i) => (
        <div key={c.id} style={{width: "100%"}}>
          <h3 style={{textAlign: "center"}}>{c.name}</h3>
          <RadioButtonGroup
            disabled={props.ratingAssignmentForm.noShow}
            options={[
              {label: "1", value: 1},
              {label: "2", value: 2},
              {label: "3", value: 3},
              {label: "4", value: 4},
              {label: "5", value: 5}
            ]}
            value={props.ratingAssignmentForm.categoryRating[i]}
            onChange={newValue => props.onAlterRatingAssignmentForm(
              ({categoryRating, ...form}) => ({
                ...form,
                categoryRating: categoryRating.map(
                  (v,j) => i === j ? newValue : v
                )
              })
            )}
          />
        </div>
      ))}
    </Card>

    <Card>
      <CardBody>
        <Button
          style={{width: "100%"}}
          size="lg"
          onClick={() => props.onSubmit()}
          disabled={!validateForm(props.ratingAssignmentForm)}
        >
          {"Submit \u25B6"}
        </Button>
      </CardBody>
    </Card>
  </div>
);

export interface JudgePageAssignmentRatingProps {
  ratingAssignment: RatingAssignment;
  ratingAssignmentForm: RatingAssignmentForm;

  onAlterRatingAssignmentForm: (f: (old: RatingAssignmentForm) => RatingAssignmentForm) => void;
  onSubmit: () => void;
}

export interface RatingAssignmentForm {
  noShow: boolean;
  categoryRating: Array<number>;
}

function validateForm(form: RatingAssignmentForm) {
  if (form.noShow) {
    return true;
  }

  for (let categoryRating of form.categoryRating) {
    if (!Number.isInteger(categoryRating) || categoryRating > 5 || categoryRating < 1) {
      return false;
    }
  }

  return true;
}
