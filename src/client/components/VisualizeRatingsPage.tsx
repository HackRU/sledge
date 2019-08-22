import React from "react";

import {
  Container,
  Button
} from "reactstrap";

export const VisualizeRatingsPage = props => {
  console.log(props.response);
  console.log(props.ready && responseToTabular(props.response));

  const tabular = props.ready && responseToTabular(props.response);

  return (
    <Container id="VisualizeRatingsPage">
      <h1>{`Visualize Ratings`}</h1>

      <Button onClick={props.onLoadVisualization}>{`Reload`}</Button>

      {props.ready && (
        <table border={3}>
          <tr>
            <td />
            {props.response.submissions.map((s, i) => (
              <td>{s.location}</td>
            ))}
          </tr>
          {props.response.judges.map((j, i) => (
            <tr key={i}>
              <td>{j.name}</td>
              {props.response.submissions.map((s,k) => (
                <td
                  style={{backgroundColor: tabular[i][k].color, width: "10px", height: "10px"}}
                >
                  {tabular[i][k].text}
                </td>
              ))}
            </tr>
          ))}
        </table>
      )}
    </Container>
  );
};


function responseToTabular(response) {
  // tabular[judge][submission]
  let tabular = [];
  for (let i=0;i<response.judges.length;i++) {
    let arr = [];
    for (let j=0;j<response.submissions.length;j++) {
      arr.push({
        color: "",
        text: ""
      });
    }
    tabular.push(arr);
  }

  for (let ass of response.scores) {
    if (!ass.active) {
      if (ass.rating < 0) {
        tabular[ass.judgeIndex][ass.submissionIndex] = {
          color: "red",
          text: ""
        };
      } else {
        tabular[ass.judgeIndex][ass.submissionIndex] = {
          color: "green",
          text: ""+ass.rating
        };
      }
    } else {
      tabular[ass.judgeIndex][ass.submissionIndex] = {
        color: "yellow",
        text: ""
      };
    }
  }

  return tabular;
}
