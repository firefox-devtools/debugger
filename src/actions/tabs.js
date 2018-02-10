/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the tabs state
 * @module actions/tabs
 */

import { removeDocument } from "../utils/editor";
import { selectSource } from "./sources";

import { getSelectedTab } from "../selectors";

import type { Tab } from "../types";
import type { ThunkArgs } from "./types";

/**
 * @memberof actions/tabs
 * @static
 */
export function addTab(tab: Tab, tabIndex: number) {
  return {
    type: "ADD_TAB",
    tab,
    tabIndex
  };
}

/**
 * @memberof actions/tabs
 * @static
 */
export function selectTab(tabIndex: number) {
  return { type: "SELECT_TAB", tabIndex };
}

/**
 * @memberof actions/tabs
 * @static
 */
export function closeTab(id: string) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    removeDocument(id);

    await dispatch({ type: "CLOSE_TAB", id });

    const selectedTab = getSelectedTab(getState());
    dispatch(
      selectSource(selectedTab.tab ? selectedTab.tab.id : "", selectedTab.index)
    );
  };
}

/**
 * @memberof actions/tabs
 * @static
 */
export function closeTabs(ids: string[]) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    ids.forEach(id => removeDocument(id));

    await dispatch({ type: "CLOSE_TABS", ids });

    const selectedTab = getSelectedTab(getState());
    dispatch(
      selectSource(selectedTab.tab ? selectedTab.tab.id : "", selectedTab.index)
    );
  };
}
