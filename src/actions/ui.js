// @flow
import { getSource, getActiveSearch, getPaneCollapse } from "../selectors";
import type { ThunkArgs } from "./types";
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

    dispatch(setPrimaryPaneTab("sources"));
    dispatch({
      type: "SHOW_SOURCE",
      sourceUrl: ""
    });

    dispatch({
      type: "SHOW_SOURCE",
      sourceUrl: source.get("url")
    });
  };
}

export function togglePaneCollapse(position: string, paneCollapsed: boolean) {
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

export function setProjectDirectoryRoot(url: Object) {
  return {
    type: "SET_PROJECT_DIRECTORY_ROOT",
    url
  };
}

export function setOrientation(orientation: OrientationType) {
  return { type: "SET_ORIENTATION", orientation };
}
