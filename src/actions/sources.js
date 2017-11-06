// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { PROMISE } from "./utils/middleware/promise";
import assert from "../utils/assert";
import { remapBreakpoints } from "./breakpoints";

import { setEmptyLines, setOutOfScopeLocations } from "./ast";
import { syncBreakpoint } from "./breakpoints";
import { searchSource } from "./project-text-search";
import { closeActiveSearch } from "./ui";

import { getPrettySourceURL, isLoaded } from "../utils/source";
import { createPrettySource } from "./sources/createPrettySource";
import { loadSourceText } from "./sources/loadSourceText";

import { prefs } from "../utils/prefs";
import { removeDocument } from "../utils/editor";
import { isThirdParty } from "../utils/source";
import { getGeneratedLocation } from "../utils/source-maps";

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
  getActiveSearch
} from "../selectors";

import type { Source } from "../types";
import type { ThunkArgs } from "./types";
import type { State } from "../reducers/types";

// If a request has been made to show this source, go ahead and
// select it.
async function checkSelectedSource(state: State, dispatch, source) {
  const pendingLocation = getPendingSelectedLocation(state);

  if (pendingLocation && !!source.url && pendingLocation.url === source.url) {
    await dispatch(selectSource(source.id, { location: pendingLocation }));
  }
}

async function checkPendingBreakpoints(state, dispatch, sourceId) {
  // source may have been modified by selectSource
  const source = getSource(state, sourceId).toJS();
  const pendingBreakpoints = getPendingBreakpointsForSource(state, source.url);
  if (!pendingBreakpoints.size) {
    return;
  }

  // load the source text if there is a pending breakpoint for it
  await dispatch(loadSourceText(source));
  const pendingBreakpointsArray = pendingBreakpoints.valueSeq().toJS();
  for (const pendingBreakpoint of pendingBreakpointsArray) {
    await dispatch(syncBreakpoint(sourceId, pendingBreakpoint));
  }
}

/**
 * Handler for the debugger client's unsolicited newSource notification.
 * @memberof actions/sources
 * @static
 */
export function newSource(source: Source) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const _source = getSource(getState(), source.id);
    if (_source) {
      return;
    }

    dispatch({ type: "ADD_SOURCE", source });

    if (prefs.clientSourceMapsEnabled) {
      await dispatch(loadSourceMap(source));
    }

    await checkSelectedSource(getState(), dispatch, source);
    await checkPendingBreakpoints(getState(), dispatch, source.id);
  };
}

export function newSources(sources: Source[]) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const filteredSources = sources.filter(
      source => !getSource(getState(), source.id)
    );

    for (const source of filteredSources) {
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

    const originalSources = urls.map(
      originalUrl =>
        ({
          url: originalUrl,
          id: sourceMaps.generatedToOriginalId(generatedSource.id, originalUrl),
          isPrettyPrinted: false,
          isWasm: false,
          isBlackBoxed: false,
          loadedState: "unloaded"
        }: Source)
    );

    dispatch({ type: "ADD_SOURCES", sources: originalSources });

    await dispatch(loadSourceText(generatedSource));
    originalSources.forEach(async source => {
      await checkSelectedSource(getState(), dispatch, source);
      checkPendingBreakpoints(getState(), dispatch, source.id);
    });
  };
}

export type SelectSourceOptions = {
  tabIndex?: number,
  location?: { line?: number, column?: number }
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
    const selectedOriginalLocation = selectedLocation
      ? await sourceMaps.getOriginalLocation(selectedLocation)
      : {};

    const url = getPrettySourceURL(source.url);
    const prettySource = getSourceByURL(getState(), url);

    if (prettySource) {
      return dispatch(
        selectSource(prettySource.get("id"), {
          location: selectedOriginalLocation
        })
      );
    }

    const newPrettySource = await dispatch(createPrettySource(sourceId));
    await dispatch(remapBreakpoints(sourceId));
    await dispatch(setEmptyLines(newPrettySource.id));

    return dispatch(
      selectSource(newPrettySource.id, { location: selectedOriginalLocation })
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
