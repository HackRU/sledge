import React from "react";

import {
  Container,
  Button
} from "reactstrap";

import {range} from "../../shared/util";

import {GetRatingScoresRequestResponseData} from "../../shared/GetRatingScoresRequestTypes";

export const VisualizeRatingsPage = (props: VisualizeRatingsPageProps) => {
  const tabular = tabulateResponse(props.response);

  return (
    <Container id="VisualizeRatingsPage">
      <h1>{`Visualize Ratings`}</h1>

      <Button onClick={props.onReload}>{`Reload`}</Button>
      <span><span>{`Last Update: `}</span><em>{(new Date(props.timestamp)).toString()}</em></span>

      <h2>{`Ratings Table`}</h2>

      <RatingsTable
        ratings={tabular}
        judges={props.response.judges}
        submissions={props.response.submissions}
      />
    </Container>
  );
};

export interface VisualizeRatingsPageProps {
  response: GetRatingScoresRequestResponseData;
  timestamp: number;

  onReload: () => void;
};

const RatingsTable = (props: {
  ratings: Array<Array<number>>,
  judges: Array<{id: number, name: string}>,
  submissions: Array<{id: number, location: number}>
}) => (
<table>
  <tbody>
    <tr>
      <td/>
        {props.submissions.map(s => (
          <td key={s.id}>{s.location.toString()}</td>
        ))}
    </tr>
    {props.judges.map((j, ji) => (
      <tr key={j.id}>
        <td>{j.name}</td>
        {props.submissions.map((s,si) => (
          <RatingCell
            key={s.id}
            rating={props.ratings[ji][si]}
          />
        ))}
        </tr>
    ))}
  </tbody>
</table>
);

const RatingCell = (props: {rating: number}) => {
  const classes = ["rating-cell"];
  if (props.rating === -3) {
    classes.push("bg-grey");
  } else if (props.rating === -2) {
    classes.push("bg-yellow");
  } else if (props.rating === -1) {
    classes.push("bg-red");
  } else if (props.rating >= 0) {
    classes.push("bg-green");
  }

  return (
    <td className={classes.join(" ")}>{props.rating >= 0 ? props.rating.toString() : ""}</td>
  );
}

/**
 * Converts the response into a 2d array such that arr[judgeIndex][submissionIndex] means
 * no-show if -1, still active if -2 and no assignment if -3, otherwise the rating.
 */
function tabulateResponse(response: GetRatingScoresRequestResponseData): Array<Array<number>> {
  let tabular = range(response.judges.length).map(_ => range(response.submissions.length).map(_ => (-3)));

  for (let ass of response.scores) {
    tabular[ass.judgeIndex][ass.submissionIndex] = ass.active ? -2 : ass.rating;
  }

  return tabular;
}
