import {
  connectAdvanced
} from "react-redux";

import {State, Action, AsyncAction} from "./types";

// Because we're using custom middleware we need a custom connect function to
// ensure type safety

export function connect<OwnProps, Props>(
  mapToProps: (
    ownProps: OwnProps,
    state: State,
    dispatch: (action: AsyncAction) => void
  ) => Props
) {
  // The type checking in react-redux isn't aware of our middleware,
  // so we cast the action to any
  function selectorFactory(dispatch: (a:any) => void) {
    return (state: State, ownProps: OwnProps) => mapToProps(
      ownProps, state, dispatch
    );
  }

  return connectAdvanced(selectorFactory);
}
