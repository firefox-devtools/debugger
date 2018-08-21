/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the editor tabs
 * @module actions/tabs
 */

import { removeDocument } from "../utils/editor";
import { selectSource } from "./sources";

import {
  getSourceByURL,
  getSourceTabs,
  getNewSelectedSourceId,
  removeSourceFromTabList,
  removeSourcesFromTabList
} from "../selectors";

import type { Action, ThunkArgs } from "./types";

export function updateTab(url: string, framework: string): Action {
  return {
    type: "UPDATE_TAB",
    url,
    framework
  };
}

export function addTab(url: string, framework?: string): Action {
  return {
    type: "ADD_TAB",
    url,
    framework
  };
}

export function moveTab(url: string, tabIndex: number): Action {
  return {
    type: "MOVE_TAB",
    url,
    tabIndex
  };
}

/**
 * @memberof actions/tabs
 * @static
 */
export function closeTab(url: string) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    removeDocument(url);

    const tabs = removeSourceFromTabList(getSourceTabs(getState()), url);
    const sourceId = getNewSelectedSourceId(getState(), tabs);
    dispatch(({ type: "CLOSE_TAB", url, tabs }: Action));
    dispatch(selectSource(sourceId));
  };
}

/**
 * @memberof actions/tabs
 * @static
 */
export function closeTabs(urls: string[]) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    urls.forEach(url => {
      const source = getSourceByURL(getState(), url);
      if (source) {
        removeDocument(source.id);
      }
    });

    const tabs = removeSourcesFromTabList(getSourceTabs(getState()), urls);
    dispatch(({ type: "CLOSE_TABS", urls, tabs }: Action));

    const sourceId = getNewSelectedSourceId(getState(), tabs);
    dispatch(selectSource(sourceId));
  };
}
