import React from "react";
import {Socket} from "../Socket";

import {LoginPage} from "../components/LoginPage";

export class LoginApp extends React.Component<any,any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return React.createElement(
      LoginPage
    );
  }
}
