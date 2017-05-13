// @flow

import { isDevelopment } from "devtools-config";

import type { ThunkArgs } from "../../../actions/types";

/**
 * A middleware that stores every action coming through the store in the passed
 * in logging object. Should only be used for tests, as it collects all
 * action information, which will cause memory bloat.
 */
export const history = (log: Object[] = []) => ({
  dispatch,
  getState
}: ThunkArgs) => {
  if (isDevelopment()) {
    console.warn(
      "Using history middleware stores all actions in state for " +
        "testing and devtools is not currently running in test " +
        "mode. Be sure this is intentional."
    );
  }
  return (next: Function) => (action: Object) => {
    log.push(action);
    next(action);
  };
};
