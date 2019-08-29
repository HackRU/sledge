import React from "react";

import {
  Container
} from "reactstrap";

export const VisualizePrizesPage = props => (
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
                  <td key={li}>{pt.judgeLocationStatuses[ji][li].toString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </Container>
);

export interface VisualizePrizesPageProps {
  judges: Array<string>;
  prizeTables: Array<{
    name: string,
    locations: Array<number>,
    judgeLocationStatuses: Array<Array<number>>
  }>;
};
