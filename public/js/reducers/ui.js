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
  previousInput: string
};

const State = makeRecord(({
  searchOn: false,
  previousInput: ""
} : UIState));

function update(state = State(), action: Action): Record<UIState> {
  switch (action.type) {
    case constants.TOGGLE_FILE_SEARCH: {
      return state.set("searchOn", action.searchOn);
    }
    case constants.SAVE_FILE_SEARCH_INPUT: {
      return state.set("previousInput", action.previousInput);
    }
    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/public/js/reducers/sources.js#L179-L185
type OuterState = { ui: Record<UIState> };

function getFileSearchState(state: OuterState): boolean {
  return state.ui.get("searchOn");
}

function getFileSearchPreviousInput(state: OuterState): boolean {
  return state.ui.get("previousInput");
}

module.exports = {
  State,
  update,
  getFileSearchState,
  getFileSearchPreviousInput
};
