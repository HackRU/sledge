import React from "react";

import {
  Container
} from "reactstrap";

export interface LoginPageProps {
};

export const LoginPage = ({
}: LoginPageProps) => (
  <Container id="LoginPage">
    <h1>{`Login`}</h1>
  </Container>
);
