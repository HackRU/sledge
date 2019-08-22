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
import {RatingAssignmentForm} from "../../shared/SubmitAssignmentRequestTypes";
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
            { label: "Yes", value: 0 },
            { label: "No", value: 1 }
          ]}
          value={props.ratingAssignmentForm.noShow ? 1 : 0}
          onChange={
            newValue => props.onAlterRatingAssignmentForm(createAlterNoShowStatus(!!newValue))
          }
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
            value={props.ratingAssignmentForm.categoryRatings[i]}
            onChange={newValue => props.onAlterRatingAssignmentForm(
              createAlterCategoryRating(i, newValue)
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

const createAlterNoShowStatus = (newNoShowStatus: boolean) => (form: RatingAssignmentForm) => {
  return setCorrectRating({
    ...form,
    noShow: newNoShowStatus
  });
}

const createAlterCategoryRating = (categoryIndex: number, newRating: number) => (form: RatingAssignmentForm) => {
  return setCorrectRating({
    ...form,
    noShow: false,
    categoryRatings: form.categoryRatings.map((v, i) => i === categoryIndex ? newRating : v)
  });
}

function setCorrectRating(form: RatingAssignmentForm): RatingAssignmentForm {
  if (form.noShow) {
    return {
      ...form,
      rating: -1
    };
  } else {
    return {
      ...form,
      rating: form.categoryRatings.reduce((a,b) => a+b, 0)
    };
  }
}


function validateForm(form: RatingAssignmentForm) {
  if (form.noShow) {
    return true;
  }

  for (let categoryRating of form.categoryRatings) {
    if (!Number.isInteger(categoryRating) || categoryRating > 5 || categoryRating < 1) {
      return false;
    }
  }

  return true;
}
