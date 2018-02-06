/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { removeDocument } from "../utils/editor";
import { selectSource } from "./sources";

import {
  getSourceByURL,
  getSourceTabs,
  getSelectedTab,
  getNewSelectedSourceId,
  removeSourcesFromTabList,
  removeSourceFromTabList
} from "../selectors";

import type { Source, Tab } from "../types";
import type { ThunkArgs } from "./types";

export function addTab(tab: Tab, tabIndex: number) {
  return {
    type: "ADD_TAB",
    tab,
    tabIndex
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function closeTab(id: string) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    removeDocument(id);
    await dispatch({ type: "CLOSE_TAB", id });
    //const tabs = removeSourceFromTabList(getSourceTabs(getState()), url);
    //const sourceId = getNewSelectedSourceId(getState(), tabs);
    const tab = getSelectedTab(getState());
    dispatch(selectSource(tab.id));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function closeTabs(ids: string[]) {
  //return { type: "CLOSE_TABS", ids };
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    ids.forEach(id => removeDocument(id));

    //const tabs = removeSourcesFromTabList(getSourceTabs(getState()), urls);
    await dispatch({ type: "CLOSE_TABS", ids });

    //const sourceId = getNewSelectedSourceId(getState(), tabs);
    const tab = getSelectedTab(getState());
    dispatch(selectSource(tab.id));
  };
}
