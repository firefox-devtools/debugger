// @flow

import { createSelector } from "reselect";
import type { Record } from "../utils/makeRecord";

type Worker = {|
  url: string
|};

// I'm copying the style from `reducers/expressions`
// we still need to get the List type and Imuttable List constructor
type DebuggeeState = {
  workers: List<Worker>
};

// makeRecord is a util that makes an immutable Record
export const State = makeRecord(
  ({
    // lets not bother with "from" now, we can move it over later
    workers: List()
  }: DebuggeeState)
);

export default function debuggee(
  state: Record<ExpressionState> = State(),
  action: Action
): Record<DebuggeeState> {
  switch (action.type) {
    case "SET_WORKERS":
      // we should use an immutable list here...
      return state.set("workers", List(action.workers));
    default:
      return state;
  }
}

type OuterState = { debuggee: Record<DebuggeeState> };

const getDebuggeeWrapper = state => state.debuggee;

// these reselect selectors are used to help us memoize the data
// so that we get the sme data back each time
export const getWorkers = createSelector(getDebuggeeWrapper, debuggee =>
  debuggee.get("workers")
);
