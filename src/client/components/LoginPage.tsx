import React from "react";

import {
  Container,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText
} from "reactstrap";

export interface LoginPageProps {
  loading: boolean;
  judges: Array<{name: string, id: number}>;

  onSelectJudge: (id: number) => void;
};

export const LoginPage = (props: LoginPageProps) => (
  <Container id="LoginPage">
    <h1>{`Login`}</h1>

    <ListGroup>
      <ListGroupItem
        color={props.loading ? "danger" : "info"}
      >
        <ListGroupItemHeading>{`Select Judge`}</ListGroupItemHeading>
        {props.loading && (
          <ListGroupItemText>{`Loading...`}</ListGroupItemText>
        )}
      </ListGroupItem>
      {props.judges.map((j,i) => (
        <ListGroupItem
          key={i}
          tag="button"
          onClick={() => props.onSelectJudge(j.id)}
        >
          {j.name}
        </ListGroupItem>
      ))}
    </ListGroup>
  </Container>
);
