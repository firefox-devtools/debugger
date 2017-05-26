// @flow

/**
 * UI reducer
 * @module reducers/ui
 */

import makeRecord from "../utils/makeRecord";
import constants from "../constants";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type ASTState = {};

export const State = makeRecord(
  ({
    fileSearchOn: false
  }: ASTState)
);

function update(
  state: Record<ASTState> = State(),
  action: Action
): Record<ASTState> {
  switch (action.type) {
    case constants.TOGGLE_PROJECT_SEARCH: {
      return state.set("projectSearchOn", action.value);
    }

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { ui: Record<ASTState> };

type SearchFieldType = "projectSearchOn" | "fileSearchOn" | "symbolSearchOn";
function getSearchState(field: SearchFieldType, state: OuterState): boolean {
  return state.ui.get(field);
}

export function getFileSearchQueryState(state: OuterState): string {
  return state.ui.get("fileSearchQuery");
}

export default update;
