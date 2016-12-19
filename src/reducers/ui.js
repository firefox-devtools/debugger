// @flow

/**
 * UI reducer
 * @module reducers/ui
 */

const constants = require("../constants");
const makeRecord = require("../utils/makeRecord");

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type UIState = {
  searchOn: boolean,
  shownSource: array
};

const State = makeRecord(({
  searchOn: false,
  shownSource: [],
} : UIState));

function update(state = State(), action: Action): Record<UIState> {
  switch (action.type) {
    case constants.TOGGLE_FILE_SEARCH: {
      return state.set("searchOn", action.searchOn);
    }

    case constants.SHOW_SOURCE: {
      let tempArr = [];
      tempArr.push(action.sourceUrl);
      tempArr.push(action.randomNum);
      return state.set("shownSource", tempArr);
    }

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { ui: Record<UIState> };

function getFileSearchState(state: OuterState): boolean {
  return state.ui.get("searchOn");
}

function getShownSource(state: OuterState): boolean {
  return state.ui.get("shownSource");
}

module.exports = {
  State,
  update,
  getFileSearchState,
  getShownSource
};
