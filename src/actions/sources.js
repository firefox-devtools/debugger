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

import { setEmptyLines, setOutOfScopeLocations, setSymbols } from "./ast";
import { syncBreakpoint } from "./breakpoints";
import { searchSource } from "./project-text-search";
import { closeActiveSearch } from "./ui";

import { getPrettySourceURL, isLoaded } from "../utils/source";
import { createLocation } from "../utils/location";
import { createPrettySource } from "./sources/createPrettySource";
import { loadSourceText } from "./sources/loadSourceText";

import { prefs } from "../utils/prefs";
import { removeDocument } from "../utils/editor";
import { isThirdParty, shouldPrettyPrint, isMinified } from "../utils/source";
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
  getActiveSearch
} from "../selectors";

import type { Source, Location } from "../types";
import type { ThunkArgs } from "./types";

// If a request has been made to show this source, go ahead and
// select it.
function checkSelectedSource(source) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const pendingLocation = getPendingSelectedLocation(getState());

    if (pendingLocation && !!source.url && pendingLocation.url === source.url) {
      await dispatch(
        selectLocation({ ...pendingLocation, sourceId: source.id })
      );
    }
  };
}

function checkPendingBreakpoints(sourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    // source may have been modified by selectLocation
    const source = getSource(getState(), sourceId);

    const pendingBreakpoints = getPendingBreakpointsForSource(
      getState(),
      source.get("url")
    );

    if (!pendingBreakpoints.size) {
      return;
    }

    // load the source text if there is a pending breakpoint for it
    await dispatch(loadSourceText(source));

    const pendingBreakpointsArray = pendingBreakpoints.valueSeq().toJS();
    for (const pendingBreakpoint of pendingBreakpointsArray) {
      await dispatch(syncBreakpoint(sourceId, pendingBreakpoint));
    }
  };
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
      dispatch(loadSourceMap(source));
    }

    dispatch(checkSelectedSource(source));
    dispatch(checkPendingBreakpoints(source.id));
  };
}

export function newSources(sources: Source[]) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const filteredSources = sources.filter(
      source => !getSource(getState(), source.id)
    );

    for (const source of filteredSources) {
      dispatch(newSource(source));
    }
  };
}

function createOriginalSource(
  originalUrl,
  generatedSource,
  sourceMaps
): Source {
  return {
    url: originalUrl,
    id: sourceMaps.generatedToOriginalId(generatedSource.id, originalUrl),
    isPrettyPrinted: false,
    isWasm: false,
    isBlackBoxed: false,
    loadedState: "unloaded"
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

    const originalSources = urls.map(url =>
      createOriginalSource(url, generatedSource, sourceMaps)
    );

    // TODO: check if this line is really needed, it introduces
    // a lot of lag to the application.
    const generatedSourceRecord = getSource(getState(), generatedSource.id);
    await dispatch(loadSourceText(generatedSourceRecord));
    dispatch(newSources(originalSources));
  };
}

declare type SelectSourceOptions = {
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
      const sourceId = source.get("id");
      const location = createLocation({ ...options.location, sourceId });
      // flow is unable to comprehend that if an options.location object
      // exists, that we have a valid Location object, and if it doesnt,
      // we have a valid { sourceId: string } object. So we are overriding
      // the error
      // $FlowIgnore
      await dispatch(selectLocation(location, options.tabIndex));
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
export function selectSource(sourceId: string, tabIndex: string = "") {
  return async ({ dispatch }: ThunkArgs) => {
    const location = createLocation({ sourceId });
    return await dispatch(selectLocation(location, tabIndex));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectLocation(location: Location, tabIndex: string = "") {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), location.sourceId);
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
      tabIndex,
      location,
      [PROMISE]: (async () => {
        await dispatch(loadSourceText(source));
        dispatch(setOutOfScopeLocations());
        const src = getSource(getState(), location.sourceId);
        const { autoPrettyPrint } = prefs;
        if (autoPrettyPrint && shouldPrettyPrint(src) && isMinified(src)) {
          await dispatch(togglePrettyPrint(src.get("id")));
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
    if (isOriginalId(sourceLocation.sourceId)) {
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

    return dispatch(selectLocation({ ...pairedLocation }));
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
    const source = getSource(getState(), sourceId);

    if (!source) {
      return {};
    }

    if (!isLoaded(source)) {
      await dispatch(loadSourceText(source));
    }

    assert(
      sourceMaps.isGeneratedId(sourceId),
      "Pretty-printing only allowed on generated sources"
    );

    const selectedLocation = getSelectedLocation(getState());
    const url = getPrettySourceURL(source.get("url"));
    const prettySource = getSourceByURL(getState(), url);

    const options = {};
    if (selectedLocation) {
      options.location = await sourceMaps.getOriginalLocation(selectedLocation);
    }

    if (prettySource) {
      const _sourceId = prettySource.get("id");
      return dispatch(
        selectLocation({ ...options.location, sourceId: _sourceId })
      );
    }

    const newPrettySource = await dispatch(createPrettySource(sourceId));
    await dispatch(remapBreakpoints(sourceId));
    await dispatch(setEmptyLines(newPrettySource.id));
    await dispatch(setSymbols(newPrettySource.id));

    return dispatch(
      selectLocation({ ...options.location, sourceId: newPrettySource.id })
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
    for (const [, source] of sources) {
      if (isThirdParty(source)) {
        continue;
      }

      await dispatch(loadSourceText(source));
      // If there is a current search query we search
      // each of the source texts as they get loaded
      if (query) {
        await dispatch(searchSource(source.get("id"), query));
      }
    }
  };
}
