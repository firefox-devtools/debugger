// @flow

/**
 * Code Coverage reducer
 * @module reducers/coverage
 */

import constants from "../constants";
import makeRecord from "../utils/makeRecord";
import { Map } from "immutable";
import fromJS from "../utils/fromJS";

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type CoverageState = {
  coverageOn: boolean,
  hitCount: Object
};

const State = makeRecord(({
  coverageOn: false,
  hitCount: Map()
} : CoverageState));

function update(state: any = State(), action: Action): Record<CoverageState> {
  switch (action.type) {
    case constants.RECORD_COVERAGE:
      return state
        .mergeIn(["hitCount"], fromJS(action.value.coverage))
        .setIn(["coverageOn"], true);

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { coverage: Record<CoverageState> };

function getHitCountForSource(state: OuterState, sourceId: string) {
  const hitCount = state.coverage.get("hitCount");
  return hitCount.get(sourceId);
}

function getCoverageEnabled(state: OuterState) {
  return state.coverage.get("coverageOn");
}

export default {
  State,
  update,
  getHitCountForSource,
  getCoverageEnabled
};
