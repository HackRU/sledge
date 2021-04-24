import React from "react";

import {
  Container,
  Input,
  Button
} from "reactstrap";

import {TextSubmit} from "./TextSubmit";
import {Socket} from "../Socket";
import { TEST_CSV_URL } from "../Devpost";

export const DevpostPage = (props: DevpostPageProps) => (
  <Container id="DevpostPage">
    <h1>{`Import Submission Data from Devpost`}</h1>

    <TextSubmit onChange={props.onImport} />

    <div><p>{`Status: `}<em>{props.status}</em></p></div>

    <div>
      <span>{`Download a `}</span>
      <a href={TEST_CSV_URL}>{`test CSV`}</a>
      <span>{`.`}</span>
    </div>
  </Container>
);

export interface DevpostPageProps {
  status: string;
  onImport: (csv: string) => void;
};
