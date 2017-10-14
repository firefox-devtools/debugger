// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * UI reducer
 * @module reducers/ui
 */

import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";

import type { Action, panelPositionType } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SymbolSearchType = "functions" | "variables";
export type ActiveSearchType =
  | "project"
  | "source"
  | "file"
  | "symbol"
  | "line";

export type UIState = {
  activeSearch: ?ActiveSearchType,
  contextMenu: any,
  symbolSearchType: SymbolSearchType,
  shownSource: string,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean,
  frameworkGroupingOn: boolean,
  projectDirectoryRoot: string,
  highlightedLineRange?: {
    start?: number,
    end?: number,
    sourceId?: number
  },
  conditionalPanelLine: null | number
};

export const State = makeRecord(
  ({
    activeSearch: null,
    contextMenu: {},
    symbolSearchType: "functions",
    shownSource: "",
    projectDirectoryRoot: "",
    startPanelCollapsed: prefs.startPanelCollapsed,
    endPanelCollapsed: prefs.endPanelCollapsed,
    frameworkGroupingOn: prefs.frameworkGroupingOn,
    highlightedLineRange: undefined,
    conditionalPanelLine: null
  }: UIState)
);

function update(
  state: Record<UIState> = State(),
  action: Action
): Record<UIState> {
  switch (action.type) {
    case "TOGGLE_ACTIVE_SEARCH": {
      return state.set("activeSearch", action.value);
    }

    case "TOGGLE_FRAMEWORK_GROUPING": {
      prefs.frameworkGroupingOn = action.value;
      return state.set("frameworkGroupingOn", action.value);
    }

    case "SET_SYMBOL_SEARCH_TYPE": {
      return state.set("symbolSearchType", action.symbolType);
    }

    case "SET_CONTEXT_MENU": {
      return state.set("contextMenu", action.contextMenu);
    }

    case "SHOW_SOURCE": {
      return state.set("shownSource", action.sourceUrl);
    }

    case "TOGGLE_PANE": {
      if (action.position == "start") {
        prefs.startPanelCollapsed = action.paneCollapsed;
        return state.set("startPanelCollapsed", action.paneCollapsed);
      }

      prefs.endPanelCollapsed = action.paneCollapsed;
      return state.set("endPanelCollapsed", action.paneCollapsed);
    }

    case "HIGHLIGHT_LINES":
      const { start, end, sourceId } = action.location;
      let lineRange = {};

      if (start && end && sourceId) {
        lineRange = { start, end, sourceId };
      }

      return state.set("highlightedLineRange", lineRange);

    case "CLEAR_HIGHLIGHT_LINES":
      return state.set("highlightedLineRange", {});

    case "OPEN_CONDITIONAL_PANEL":
      return state.set("conditionalPanelLine", action.line);

    case "CLOSE_CONDITIONAL_PANEL":
      return state.set("conditionalPanelLine", null);

    case "SET_PROJECT_DIRECTORY_ROOT":
      prefs.projectDirectoryRoot = action.url;
      return state.set("projectDirectoryRoot", action.url);

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { ui: Record<UIState> };

export function getActiveSearch(state: OuterState): ActiveSearchType {
  return state.ui.get("activeSearch");
}

export function getContextMenu(state: OuterState): any {
  return state.ui.get("contextMenu");
}

export function getFrameworkGroupingState(state: OuterState): boolean {
  return state.ui.get("frameworkGroupingOn");
}

export function getSymbolSearchType(state: OuterState): SymbolSearchType {
  return state.ui.get("symbolSearchType");
}

export function getShownSource(state: OuterState): boolean {
  return state.ui.get("shownSource");
}

export function getPaneCollapse(
  state: OuterState,
  position: panelPositionType
): boolean {
  if (position == "start") {
    return state.ui.get("startPanelCollapsed");
  }

  return state.ui.get("endPanelCollapsed");
}

export function getHighlightedLineRange(state: OuterState) {
  return state.ui.get("highlightedLineRange");
}

export function getConditionalPanelLine(state: OuterState): null | number {
  return state.ui.get("conditionalPanelLine");
}

export function getProjectDirectoryRoot(state: OuterState): boolean {
  return state.ui.get("projectDirectoryRoot");
}

export default update;
