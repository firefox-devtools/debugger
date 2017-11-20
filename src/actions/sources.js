/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { PROMISE } from "./utils/middleware/promise";
import assert from "../utils/assert";
import { remapBreakpoints } from "./breakpoints";
import { throttle } from "lodash";
import { setEmptyLines, setOutOfScopeLocations } from "./ast";
import { syncBreakpoint } from "./breakpoints";
import { searchSource } from "./project-text-search";
import { closeActiveSearch } from "./ui";

import { getPrettySourceURL, isLoaded } from "../utils/source";
import { createPrettySource } from "./sources/createPrettySource";
import { loadSourceText } from "./sources/loadSourceText";

import { prefs } from "../utils/prefs";
import { removeDocument } from "../utils/editor";
import { isThirdParty, isMinified, shouldPrettyPrint } from "../utils/source";
import { getGeneratedLocation } from "../utils/source-maps";
import { isOriginalId } from "devtools-source-map";
import {
  getSource,
  getSources,
  getSourceByURL,
  getPendingSelectedLocation,
  getPendingBreakpointsForSource,
  getSourceTabs,
  getNewSelectedSourceId,
  getSelectedLocation,
  removeSourcesFromTabList,
  removeSourceFromTabList,
  getTextSearchQuery,
  getActiveSearch,
  getGeneratedSource
} from "../selectors";

import type { Source } from "../types";
import type { ThunkArgs } from "./types";
import type { State } from "../reducers/types";

export type SelectSourceOptions = {
  tabIndex?: number,
  location?: { line: number, column?: ?number }
};

/**
 * Deterministically select a source that has a given URL. This will
 * work regardless of the connection status or if the source exists
 * yet. This exists mostly for external things to interact with the
 * debugger.
 *
 * @memberof actions/sources
 * @static
 */
export function selectSourceURL(
  url: string,
  options: SelectSourceOptions = {}
) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSourceByURL(getState(), url);
    if (source) {
      await dispatch(selectSource(source.get("id"), options));
    } else {
      dispatch({
        type: "SELECT_SOURCE_URL",
        url: url,
        tabIndex: options.tabIndex,
        location: options.location
      });
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectSource(id: string, options: SelectSourceOptions = {}) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), id);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch({ type: "CLEAR_SELECTED_SOURCE" });
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    dispatch(addTab(source.toJS(), 0));

    return dispatch({
      type: "SELECT_SOURCE",
      source: source.toJS(),
      tabIndex: options.tabIndex,
      location: options.location || {},
      [PROMISE]: (async () => {
        await dispatch(loadSourceText(source.toJS()));
        await dispatch(setOutOfScopeLocations());
        const src = getSource(getState(), id).toJS();
        if (shouldPrettyPrint(src) && isMinified(src.id, src.text)) {
          await dispatch(togglePrettyPrint(src.id));
        }
      })()
    });
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function jumpToMappedLocation(sourceLocation: any) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    if (!client) {
      return;
    }

    const source = getSource(getState(), sourceLocation.sourceId);
    let pairedLocation;
    if (sourceMaps.isOriginalId(sourceLocation.sourceId)) {
      pairedLocation = await getGeneratedLocation(
        getState(),
        source.toJS(),
        sourceLocation,
        sourceMaps
      );
    } else {
      pairedLocation = await sourceMaps.getOriginalLocation(
        sourceLocation,
        source.toJS()
      );
    }

    return dispatch(
      selectSource(pairedLocation.sourceId, { location: pairedLocation })
    );
  };
}

export function addTab(source: Source, tabIndex: number) {
  return {
    type: "ADD_TAB",
    source,
    tabIndex
  };
}

export function moveTab(url: string, tabIndex: number) {
  return {
    type: "MOVE_TAB",
    url,
    tabIndex
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function closeTab(url: string) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    removeDocument(url);
    const tabs = removeSourceFromTabList(getSourceTabs(getState()), url);
    const sourceId = getNewSelectedSourceId(getState(), tabs);

    dispatch({ type: "CLOSE_TAB", url, tabs });
    dispatch(selectSource(sourceId));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function closeTabs(urls: string[]) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    urls.forEach(url => {
      const source = getSourceByURL(getState(), url);
      if (source) {
        removeDocument(source.get("id"));
      }
    });

    const tabs = removeSourcesFromTabList(getSourceTabs(getState()), urls);
    const sourceId = getNewSelectedSourceId(getState(), tabs);

    dispatch({ type: "CLOSE_TABS", urls, tabs });
    dispatch(selectSource(sourceId));
  };
}

/**
 * Toggle the pretty printing of a source's text. All subsequent calls to
 * |getText| will return the pretty-toggled text. Nothing will happen for
 * non-javascript files.
 *
 * @memberof actions/sources
 * @static
 * @param string id The source form from the RDP.
 * @returns Promise
 *          A promise that resolves to [aSource, prettyText] or rejects to
 *          [aSource, error].
 */
export function togglePrettyPrint(sourceId: string) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const source = getSource(getState(), sourceId).toJS();

    if (!source || !isLoaded(source)) {
      return {};
    }

    assert(
      sourceMaps.isGeneratedId(sourceId),
      "Pretty-printing only allowed on generated sources"
    );

    const selectedLocation = getSelectedLocation(getState());
    const url = getPrettySourceURL(source.url);
    const prettySource = getSourceByURL(getState(), url);

    const options = {};
    if (selectedLocation) {
      options.location = await sourceMaps.getOriginalLocation(selectedLocation);
    }

    if (prettySource) {
      return dispatch(selectSource(prettySource.get("id"), options));
    }

    const newPrettySource = await dispatch(createPrettySource(sourceId));
    await dispatch(remapBreakpoints(sourceId));
    await dispatch(setEmptyLines(newPrettySource.id));

    return dispatch(selectSource(newPrettySource.id, options));
  };
}

export function toggleBlackBox(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { isBlackBoxed, id } = source;

    return dispatch({
      type: "BLACKBOX",
      source,
      [PROMISE]: client.blackBox(id, isBlackBoxed)
    });
  };
}

/**
  Load the text for all the available sources
 * @memberof actions/sources
 * @static
 */
export function loadAllSources() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sources = getSources(getState());
    const query = getTextSearchQuery(getState());
    for (const [, src] of sources) {
      const source = src.toJS();
      if (isThirdParty(source)) {
        continue;
      }

      await dispatch(loadSourceText(source));
      // If there is a current search query we search
      // each of the source texts as they get loaded
      if (query) {
        await dispatch(searchSource(source.id, query));
      }
    }
  };
}
