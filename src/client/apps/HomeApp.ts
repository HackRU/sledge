import React from "react";

import {HomePage, HomePageProps} from "../components/HomePage";

export class HomeApp extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  getPageProps(): HomePageProps {
    return {
      onSegue: to => {window.location.hash = to;}
    };
  }

  render() {
    return React.createElement(
      HomePage,
      this.getPageProps()
    );
  }
}
