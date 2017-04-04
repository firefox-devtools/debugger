// @flow
import constants from "../constants";
import type { ThunkArgs } from "./types";

export function recordCoverage() {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    const { coverage } = await client.recordCoverage();

    return dispatch({
      type: constants.RECORD_COVERAGE,
      value: { coverage }
    });
  };
}
