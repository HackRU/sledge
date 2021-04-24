import React from "react";

/**
 * An application is a top-level React component. At any given time there should be only one Application mounted on
 * the page, and it should never be unmounted
 */
export class Application<T> extends React.Component<ApplicationProps, T> {
  constructor(props: any) {
    super(props);
  }

  ready() {
  }
}

export interface ApplicationProps {
  originalHash: string;
}
