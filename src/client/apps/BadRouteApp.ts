import React from "react";
import { pages } from "../directory";
import { BadRoutePage } from "../components/BadRoutePage";
import {Application, ApplicationProps} from "../Application";

/**
 * This will render when we get a route that doesn't exist
 */
export class BadRouteApp extends Application<never> {
  pageHash: string;

  constructor(props: ApplicationProps) {
    super(props);
    this.pageHash = document.location.hash;
  }

  render() {
    return React.createElement(
      BadRoutePage,
      {
        currentHash: this.props.originalHash,
        pages
      }
    );
  }
}
