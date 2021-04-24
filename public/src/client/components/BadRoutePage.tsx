import * as React from "react";

import {
  Container
} from "reactstrap";

export interface BadRoutePageProps {
  pages: Array<any>;
  currentHash: string;
}

export const BadRoutePage = ({
  pages,
  currentHash
}: BadRoutePageProps) => (
  <Container id="BadRouteApp">
    <h1>{`Bad Route`}</h1>

    <p>
      {`The page you are looking for, `}<em>{currentHash}</em>
      {`, does note exist.`}
    </p>

    <p>{`Here is a list of valid routes:`}</p>

    <ul>
      {pages.map(page => (
        <li>
          <a href={`/${page.canonical}`}>
            {page.canonical}
          </a>
        </li>
      ))}
    </ul>
  </Container>
);
