import React from "react";

import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Button
} from "reactstrap";

export const HomePage = (props: HomePageProps) => (
  <Container id="HomePage">
    <h1>{`Sledge`}</h1>

    <Card>
      <CardBody>
        <CardTitle>
          <h2>{`Welcome to Sledge!`}</h2>
          </CardTitle>
      <div style={{margin: "10px"}}>
        <Button
          onClick={() => props.onSegue("#login")}
        >
          {`Login`}
        </Button>
      </div>
      <div style={{margin: "10px"}}>
        <Button
          onClick={() => props.onSegue("#judge")}
        >
          {`Start Judging!`}
        </Button>
      </div>
      </CardBody>
    </Card>
  </Container>
);

export interface HomePageProps {
  onSegue: (to: string) => void;
};
