import React from "react";

import {
  Container
} from "reactstrap";

export const VisualizePrizesPage = (props: VisualizePrizesPageProps) => (
  <Container id="VisualizePrizesPage">
    <h1>{`Visualize Prizes`}</h1>

    {props.prizeTables.map((pt, k1) => (
      <div key={k1}>
        <h2>{`Status Table: ${pt.name}`}</h2>

        <table>
          <tbody>
            <tr>
              <td/>
              {pt.locations.map((loc, k2) => (
                <td key={k2}>{loc.toString()}</td>
              ))}
            </tr>
            {props.judges.map((name, ji) => (
              <tr key={ji}>
                <td>{name}</td>
                {pt.locations.map((l, li) => (
                  <td
                    key={li}
                    style={{background: colorFromStatus(pt.statuses[ji][li])}}
                  >
                    {' '}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </Container>
);

function colorFromStatus(statusObj: JudgeSubmissionStatus) {
  if (statusObj.status === "JSSTATUS_NONE") {
    return "gray";
  } else if (statusObj.status === "JSSTATUS_ACTIVE") {
    return "yellow";
  } else if (statusObj.status === "JSSTATUS_NOSHOW") {
    return "red";
  } else if (statusObj.status === "JSSTATUS_COMPLETE") {
    return "green";
  } else {
    return "orange";
  }
}

export interface VisualizePrizesPageProps {
  judges: Array<string>;
  prizeTables: Array<PrizeTable>;
};

export interface PrizeTable {
  name: string;
  locations: Array<number>;

  // statuses[judgeIndex][submissionEligibilityIndex]
  statuses: Array<Array<JudgeSubmissionStatus>>;
};

export interface JudgeSubmissionStatus {
  status: string;
};
