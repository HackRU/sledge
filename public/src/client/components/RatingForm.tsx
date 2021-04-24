import React from "react";

import {
  CardBody,
  CardTitle,
  ButtonGroup,
  Button
} from "reactstrap";
import {RadioButtonGroup} from "./RadioButtonGroup";
import {CardSection} from "./CardSection";

export const RatingForm = (props: RatingFormProps) => (
  <form>
    <CardSection>
      <CardBody>
        <CardTitle>
          <h2>{`Overall Rating: ${props.submissionName} (table ${props.submissionLocation})`}</h2>
          <h3>{`Link to Submission: `} <a href={props.submissionURL} target="_blank">{props.submissionURL}</a></h3>
        </CardTitle>
      </CardBody>
    </CardSection>

    <CardSection>
      <CardBody>
        <CardTitle>
          <h2>{`Did the submission show up?`}</h2>
        </CardTitle>
        <RadioButtonGroup
          options={[
            { label: "Yes", value: 0 },
            { label: "No", value: 1}
          ]}
          value={props.noShow ? 1 : 0}
          onChange={newValue => props.onChangeNoShow(!!newValue)}
          size="lg"
        />
      </CardBody>
    </CardSection>

    <CardSection>
      <>
        {props.categories.map((catName, i) => (
          <div key={i} style={{width: "100%"}}>
            <h3 style={{textAlign: "center"}}>{catName}</h3>
            <RadioButtonGroup
              size="lg"
              disabled={props.noShow}
              options={[
                { label: "1", value: 1 },
                { label: "2", value: 2 },
                { label: "3", value: 3 },
                { label: "4", value: 4 },
                { label: "5", value: 5 }
              ]}
              value={props.ratings[i]}
              onChange={newValue => props.onChangeRating(i, newValue)}
            />
          </div>
        ))}
      </>
    </CardSection>

    <CardSection>
      <CardBody>
        <Button
          style={{width: "100%"}}
          size="lg"
          onClick={() => props.onSubmit()}
          disabled={!props.canSubmit}
        >
          {"Submit \u25B6"}
        </Button>
      </CardBody>
    </CardSection>
  </form>
);

export interface RatingFormProps {
  submissionName: string;
  submissionURL: string,
  submissionLocation: number
  categories: Array<string>;

  noShow: boolean;
  ratings: Array<number>;
  canSubmit: boolean;

  onChangeNoShow: (newValue: boolean) => void;
  onChangeRating: (ratingIndex: number, newRating: number) => void;
  onSubmit: () => void;
}
