import React from "react";
import { pages } from "../directory";
import { BadRoutePage } from "../components/BadRoutePage";

/**
 * This will render when we get a route that doesn't exist
 */
export class BadRouteApp extends React.Component {
  pageHash: string;

  constructor(props) {
    super(props);
    this.pageHash = document.location.hash;
  }

  render() {
    return React.createElement(
      BadRoutePage,
      {
        currentHash: this.pageHash,
        pages
      }
    );
  }
}
