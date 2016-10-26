// @flow
const constants = require("../constants");
const makeRecord = require("../utils/makeRecord");

import type { Action } from "../actions/types";

export type UIState = {
  searchOn: boolean
};

const State = makeRecord(({
  searchOn: false
} : UIState));

function update(state = State(), action: Action) {
  switch (action.type) {
    case constants.TOGGLE_FILE_SEARCH: {
      return state.set("searchOn", action.searchOn);
    }
    default: {
      return state;
    }
  }
}

function getFileSearchState(state): boolean {
  return state.ui.get("searchOn");
}

module.exports = {
  State,
  update,
  getFileSearchState
};
