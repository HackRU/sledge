import {
  InferableComponentEnhancerWithProps,
  connect as wrappedConnect
} from "react-redux";

import {JudgeState} from "./state.js";
import {Action} from "./actions";

export function connect<TStateProps, TDispatchProps, TOwnProps>(
  mapStateToProps? : (s:JudgeState) => TStateProps,
  mapDispatchToProps? : (d:(e:Action)=>void) => TDispatchProps
) : InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps> {
  return wrappedConnect(mapStateToProps, mapDispatchToProps);
}
