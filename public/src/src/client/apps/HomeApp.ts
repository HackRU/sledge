import React from "react";

import {HomePage, HomePageProps} from "../components/HomePage";
import {segue} from "../util";
import {Application} from "../Application";

export class HomeApp extends Application<any> {
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
