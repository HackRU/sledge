import React from "react";

import {
  Container,
  Input,
  Button
} from "reactstrap";

import {TextSubmit} from "./TextSubmit";
import {Socket} from "../Socket";

export const DevpostPage = (props: DevpostPageProps) => (
  <Container id="DevpostPage">
    <h1>{`Import Submission Data from Devpost`}</h1>

    <TextSubmit onChange={props.onImport} />

    <p>{`Status: `}<em>{props.status}</em></p>
  </Container>
);

export interface DevpostPageProps {
  status: string;
  onImport: (csv: string) => void;
};
