import React from "react";

import {
  Container,
  Input,
  ButtonGroup,
  Button
} from "reactstrap";

import {
  pages
} from "./Router";

export class IndexApp extends React.Component<any,any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Container id="IndexApp">
        <h1>{`Sledge`}</h1>

        <ul>
          {pages.map((p,i) => (
            <li key={i}>
              <a href={p.canonical}>{p.canonical}</a>
            </li>
          ))}
        </ul>
      </Container>
    );
  }
}
