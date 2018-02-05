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
  return { type: "CLOSE_TAB", id };
  /*return ({ dispatch, getState, client }: ThunkArgs) => {
    //removeDocument(url);
    //const tabs = removeSourceFromTabList(getSourceTabs(getState()), url);
    //const sourceId = getNewSelectedSourceId(getState(), tabs);
    //dispatch(selectSource(sourceId));
  };*/
}

/**
 * @memberof actions/sources
 * @static
 */
export function closeTabs(ids: string[]) {
  return { type: "CLOSE_TABS", ids };
  /*return ({ dispatch, getState, client }: ThunkArgs) => {
    urls.forEach(url => {
      const source = getSourceByURL(getState(), url);
      if (source) {
        removeDocument(source.get("id"));
      }
    });

    //const tabs = removeSourcesFromTabList(getSourceTabs(getState()), urls);
    //dispatch({ type: "CLOSE_TABS", urls, tabs });

    //const sourceId = getNewSelectedSourceId(getState(), tabs);
    //dispatch(selectSource(sourceId));
  };*/
}
