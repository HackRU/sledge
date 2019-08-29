import React from "react";

import {ControlPanelPage} from "../components/ControlPanelPage";

export class ControlPanelApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  getPageProps() {
    return {};
  }

  render() {
    return React.createElement(
      ControlPanelPage,
      this.getPageProps()
    );
  }
}
