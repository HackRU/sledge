import React from "react";

import {HomePage, HomePageProps} from "../components/HomePage";
import {segue} from "../util";

export class HomeApp extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  getPageProps(): HomePageProps {
    return {
      onSegue: segue
    };
  }

  render() {
    return React.createElement(
      HomePage,
      this.getPageProps()
    );
  }
}
