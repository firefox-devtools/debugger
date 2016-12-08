// @flow
const constants = require("../constants");
import type { ThunkArgs } from "./types";

function recordCoverage() {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    const { coverage } = await client.recordCoverage();

    return dispatch({
      type: constants.RECORD_COVERAGE,
      value: { coverage }
    });
  };
}

module.exports = {
  recordCoverage
};
