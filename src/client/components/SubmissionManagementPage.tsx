import React from "react";

import {
  Container
} from "reactstrap";

import {
  TabularActions
} from "./TabularActions";

export const SubmissionManagementPage = props => (
  <Container id="SubmissionManagementPage">
    <h1>{`Submission Management`}</h1>

    <TabularActions
      headings={["Loc", "Track", "Name", "Average Rating", "Average Rating Normalized"]}
      data={props.submissions.map(sub => [
        sub.location.toString(),
        sub.track,
        sub.name,
        Math.round(sub.averageRating).toString(),
        Math.round(sub.normalizedRating).toString()
      ])}
      actions={[]}
    />
  </Container>
);

export interface SubmissionManagementPageProps {
  submissions: Array<{
    location: number,
    track: string,
    name: string,
    averageRating: number,
    normalizedRating: number
  }>;
}
