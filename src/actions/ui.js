/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getActiveSearch,
  getPaneCollapse,
  getQuickOpenEnabled,
  getSource
} from "../selectors";
import { getProjectDirectoryRoot } from "../reducers/ui";
import type { ThunkArgs, panelPositionType } from "./types";
import { getRawSourceURL } from "../utils/source";

import type {
  ActiveSearchType,
  OrientationType,
  SelectedPrimaryPaneTabType
} from "../reducers/ui";

export function setContextMenu(type: string, event: any) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({ type: "SET_CONTEXT_MENU", contextMenu: { type, event } });
  };
}

export function setPrimaryPaneTab(tabName: SelectedPrimaryPaneTabType) {
  return { type: "SET_PRIMARY_PANE_TAB", tabName };
}

export function closeActiveSearch() {
  return {
    type: "TOGGLE_ACTIVE_SEARCH",
    value: null
  };
}

export function setActiveSearch(activeSearch?: ActiveSearchType) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const activeSearchState = getActiveSearch(getState());
    if (activeSearchState === activeSearch) {
      return;
    }

    if (getQuickOpenEnabled(getState())) {
      dispatch({ type: "CLOSE_QUICK_OPEN" });
    }

    dispatch({
      type: "TOGGLE_ACTIVE_SEARCH",
      value: activeSearch
    });
  };
}

export function toggleFrameworkGrouping(toggleValue: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "TOGGLE_FRAMEWORK_GROUPING",
      value: toggleValue
    });
  };
}

export function showSource(sourceId: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);

    if (getPaneCollapse(getState(), "start")) {
      dispatch({
        type: "TOGGLE_PANE",
        position: "start",
        paneCollapsed: false
      });
    }

    dispatch(setPrimaryPaneTab("sources"));
    dispatch({
      type: "SHOW_SOURCE",
      sourceUrl: ""
    });

    dispatch({
      type: "SHOW_SOURCE",
      sourceUrl: getRawSourceURL(source.get("url"))
    });
  };
}

export function togglePaneCollapse(
  position: panelPositionType,
  paneCollapsed: boolean
) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const prevPaneCollapse = getPaneCollapse(getState(), position);
    if (prevPaneCollapse === paneCollapsed) {
      return;
    }

    dispatch({
      type: "TOGGLE_PANE",
      position,
      paneCollapsed
    });
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function highlightLineRange(location: {
  start: number,
  end: number,
  sourceId: number
}) {
  return {
    type: "HIGHLIGHT_LINES",
    location
  };
}

export function flashLineRange(location: {
  start: number,
  end: number,
  sourceId: number
}) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch(highlightLineRange(location));
    setTimeout(() => dispatch(clearHighlightLineRange()), 200);
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function clearHighlightLineRange() {
  return {
    type: "CLEAR_HIGHLIGHT_LINES"
  };
}

export function openConditionalPanel(line: ?number) {
  if (!line) {
    return;
  }

  return {
    type: "OPEN_CONDITIONAL_PANEL",
    line
  };
}

export function closeConditionalPanel() {
  return {
    type: "CLOSE_CONDITIONAL_PANEL"
  };
}

export function clearProjectDirectoryRoot() {
  return {
    type: "SET_PROJECT_DIRECTORY_ROOT",
    url: ""
  };
}

export function setProjectDirectoryRoot(newRoot: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const curRoot = getProjectDirectoryRoot(getState());
    if (newRoot && curRoot) {
      const temp = newRoot.split("/");
      temp.splice(0, 2);
      newRoot = `${curRoot}/${temp.join("/")}`;
    }

    dispatch({
      type: "SET_PROJECT_DIRECTORY_ROOT",
      url: newRoot
    });
  };
}

export function setOrientation(orientation: OrientationType) {
  return { type: "SET_ORIENTATION", orientation };
}
