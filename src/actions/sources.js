// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { PROMISE } from "../utils/redux/middleware/promise";
import assert from "../utils/assert";
import { remapBreakpoints } from "./breakpoints";

import { setSymbols, setOutOfScopeLocations } from "./ast";
import { syncBreakpoint } from "./breakpoints";
import { searchSource } from "./project-text-search";

import { getPrettySourceURL } from "../utils/source";
import { createPrettySource } from "./sources/createPrettySource";

import { prefs } from "../utils/prefs";
import { removeDocument } from "../utils/editor";

import {
  getSource,
  getSources,
  getSourceByURL,
  getPendingSelectedLocation,
  getPendingBreakpoints,
  getSourceTabs,
  getNewSelectedSourceId,
  getSelectedLocation,
  removeSourcesFromTabList,
  removeSourceFromTabList,
  getTextSearchQuery,
  getActiveSearchState
} from "../selectors";

import type { Source } from "../types";
import type { ThunkArgs } from "./types";
import type { State } from "../reducers/types";

// If a request has been made to show this source, go ahead and
// select it.
function checkSelectedSource(state: State, dispatch, source) {
  const pendingLocation = getPendingSelectedLocation(state);

  if (pendingLocation && !!source.url && pendingLocation.url === source.url) {
    dispatch(selectSource(source.id, { line: pendingLocation.line }));
  }
}

async function checkPendingBreakpoint(
  state: State,
  dispatch,
  pendingBreakpoint,
  source
) {
  const { sourceUrl } = pendingBreakpoint.location;
  const sameSource = sourceUrl && sourceUrl === source.url;

  if (sameSource) {
    await dispatch(syncBreakpoint(source.id, pendingBreakpoint));
  }
}

async function checkPendingBreakpoints(state, dispatch, source) {
  const pendingBreakpoints = getPendingBreakpoints(state);
  if (!pendingBreakpoints) {
    return;
  }

  const pendingBreakpointsArray = pendingBreakpoints.valueSeq().toJS();
  for (let pendingBreakpoint of pendingBreakpointsArray) {
    await checkPendingBreakpoint(state, dispatch, pendingBreakpoint, source);
  }
}

/**
 * Handler for the debugger client's unsolicited newSource notification.
 * @memberof actions/sources
 * @static
 */
export function newSource(source: Source) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "ADD_SOURCE", source });
    if (prefs.clientSourceMapsEnabled) {
      await dispatch(loadSourceMap(source));
    }

    checkSelectedSource(getState(), dispatch, source);
    await checkPendingBreakpoints(getState(), dispatch, source);
  };
}

export function newSources(sources: Source[]) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const filteredSources = sources.filter(
      source => !getSource(getState(), source.id)
    );

    for (let source of filteredSources) {
      await dispatch(newSource(source));
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function loadSourceMap(generatedSource) {
  return async function({ dispatch, getState, sourceMaps }: ThunkArgs) {
    const urls = await sourceMaps.getOriginalURLs(generatedSource);
    if (!urls) {
      // If this source doesn't have a sourcemap, do nothing.
      return;
    }

    let state = getState();
    const originalSources = urls.map(originalUrl => {
      return {
        url: originalUrl,
        id: sourceMaps.generatedToOriginalId(generatedSource.id, originalUrl),
        isPrettyPrinted: false
      };
    });

    dispatch({ type: "ADD_SOURCES", sources: originalSources });

    originalSources.forEach(source => {
      checkSelectedSource(state, dispatch, source);
      checkPendingBreakpoints(state, dispatch, source);
    });
  };
}

export type SelectSourceOptions = { tabIndex?: number, line?: number };

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
  return ({ dispatch, getState }: ThunkArgs) => {
    const source = getSourceByURL(getState(), url);
    if (source) {
      dispatch(selectSource(source.get("id"), options));
    } else {
      dispatch({
        type: "SELECT_SOURCE_URL",
        url: url,
        tabIndex: options.tabIndex,
        line: options.line
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

    let source = getSource(getState(), id);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch({ type: "CLEAR_SELECTED_SOURCE" });
    }

    const activeSearch = getActiveSearchState(getState());
    if (activeSearch !== "file") {
      dispatch({ type: "TOGGLE_ACTIVE_SEARCH", value: null });
    }

    dispatch(addTab(source.toJS(), 0));

    return dispatch({
      type: "SELECT_SOURCE",
      source: source.toJS(),
      tabIndex: options.tabIndex,
      line: options.line,
      [PROMISE]: (async () => {
        await dispatch(loadSourceText(source.toJS()));
        await dispatch(setOutOfScopeLocations());
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
      pairedLocation = await sourceMaps.getGeneratedLocation(
        sourceLocation,
        source.toJS()
      );
    } else {
      pairedLocation = await sourceMaps.getOriginalLocation(
        sourceLocation,
        source.toJS()
      );
    }

    return dispatch(
      selectSource(pairedLocation.sourceId, { line: pairedLocation.line })
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

    if (source && source.loading) {
      return {};
    }

    assert(
      sourceMaps.isGeneratedId(sourceId),
      "Pretty-printing only allowed on generated sources"
    );
    console.log("hi");

    const selectedLocation = getSelectedLocation(getState());
    const selectedOriginalLocation = await sourceMaps.getOriginalLocation(
      selectedLocation
    );

    const url = getPrettySourceURL(source.url);
    const prettySource = getSourceByURL(getState(), url);

    if (prettySource) {
      return dispatch(
        selectSource(prettySource.get("id"), {
          line: selectedOriginalLocation.line
        })
      );
    }

    const { source: newPrettySource } = await dispatch(
      createPrettySource(sourceId)
    );

    dispatch(remapBreakpoints(sourceId));

    return dispatch(
      selectSource(newPrettySource.id, {
        line: selectedOriginalLocation.line
      })
    );
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
 * @memberof actions/sources
 * @static
 */
export function loadSourceText(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    // Fetch the source text only once.
    if (source.text) {
      return Promise.resolve(source);
    }

    await dispatch({
      type: "LOAD_SOURCE_TEXT",
      source: source,
      [PROMISE]: (async function() {
        if (sourceMaps.isOriginalId(source.id)) {
          return await sourceMaps.getOriginalSourceText(source);
        }

        const response = await client.sourceContents(source.id);

        return {
          id: source.id,
          text: response.source,
          contentType: response.contentType || "text/javascript"
        };
      })()
    });

    await dispatch(setSymbols(source.id));
  };
}

/**
  Load the text for all the avaliable sources
 * @memberof actions/sources
 * @static
 */
export function loadAllSources() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sources = getSources(getState());
    const query = getTextSearchQuery(getState());
    for (const [, src] of sources) {
      const source = src.toJS();
      await dispatch(loadSourceText(source));
      // If there is a current search query we search
      // each of the source texts as they get loaded
      if (query) {
        await dispatch(searchSource(source, query));
      }
    }
  };
}
