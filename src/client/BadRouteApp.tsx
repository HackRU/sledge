import React from "react";

import {
  Container,
  Input
} from "reactstrap";

export class BadRouteApp extends React.Component {
  pageHash: string;

  constructor(props: any) {
    super(props);

    this.pageHash = document.location.hash;
  }

  render() {
    return (
      <Container id="BadRouteApp">
        <h1>{`ERROR: Bad Route`}</h1>

        <p>
          {`You have attempted to access the page `}
          {this.pageHash}
          {` but it appears this page does not exist.`}
        </p>

      </Container>
    );
  }
}
