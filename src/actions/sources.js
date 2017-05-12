// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import defer from "../utils/defer";
import { PROMISE } from "../utils/redux/middleware/promise";
import assert from "../utils/assert";
import { updateFrameLocations } from "../utils/pause";
import { addBreakpoint } from "./breakpoints";
import { isEnabled } from "devtools-config";

import { prettyPrint } from "../utils/pretty-print";
import { getPrettySourceURL } from "../utils/source";

import constants from "../constants";
import { prefs } from "../utils/prefs";
import { removeDocument } from "../utils/editor";

import {
  getSource,
  getSourceByURL,
  getSourceText,
  getBreakpoint,
  getPendingSelectedLocation,
  getPendingBreakpoints,
  getFrames
} from "../selectors";

import type { Source, SourceText } from "../types";
import type { ThunkArgs } from "./types";

// If a request has been made to show this source, go ahead and
// select it.
function checkSelectedSource(state, dispatch, source) {
  const pendingLocation = getPendingSelectedLocation(state);

  if (pendingLocation && pendingLocation.url === source.url) {
    dispatch(selectSource(source.id, { line: pendingLocation.line }));
  }
}

async function checkPendingBreakpoint(
  state,
  dispatch,
  pendingBreakpoint,
  source
) {
  const {
    location: { line, sourceUrl, column },
    condition
  } = pendingBreakpoint;
  const sameSource = sourceUrl && sourceUrl === source.url;
  const location = { sourceId: source.id, sourceUrl, line, column };
  const bp = getBreakpoint(state, location);

  if (sameSource && !bp) {
    if (location.column && isEnabled("columnBreakpoints")) {
      await dispatch(addBreakpoint(location, { condition }));
    } else {
      await dispatch(addBreakpoint(location, { condition }));
    }
  }
}

async function checkPendingBreakpoints(state, dispatch, source) {
  const pendingBreakpoints = getPendingBreakpoints(state);
  if (!pendingBreakpoints) {
    return;
  }

  const pendingBreakpointsList = pendingBreakpoints.valueSeq().toJS();
  for (let pendingBreakpoint of pendingBreakpointsList) {
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
    if (prefs.clientSourceMapsEnabled) {
      await dispatch(loadSourceMap(source));
    }

    dispatch({ type: constants.ADD_SOURCE, source });

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

    dispatch({ type: constants.ADD_SOURCES, sources: originalSources });

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
        type: constants.SELECT_SOURCE_URL,
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
      return;
    }

    source = source.toJS();

    // Make sure to start a request to load the source text.
    dispatch(loadSourceText(source));

    dispatch({ type: constants.TOGGLE_PROJECT_SEARCH, value: false });

    dispatch({
      type: constants.SELECT_SOURCE,
      source: source,
      tabIndex: options.tabIndex,
      line: options.line
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

/**
 * @memberof actions/sources
 * @static
 */
export function closeTab(url: string) {
  removeDocument(url);
  return { type: constants.CLOSE_TAB, url };
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

    dispatch({ type: constants.CLOSE_TABS, urls });
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
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const source = getSource(getState(), sourceId).toJS();
    let sourceText = getSourceText(getState(), sourceId);
    if (sourceText) {
      sourceText = sourceText.toJS();
    }

    if (sourceText && sourceText.loading) {
      return {};
    }

    assert(
      sourceMaps.isGeneratedId(sourceId),
      "Pretty-printing only allowed on generated sources"
    );

    const url = getPrettySourceURL(source.url);
    const id = sourceMaps.generatedToOriginalId(source.id, url);
    const originalSource = { url, id, isPrettyPrinted: false };
    dispatch({ type: constants.ADD_SOURCE, source: originalSource });

    return dispatch({
      type: constants.TOGGLE_PRETTY_PRINT,
      source: originalSource,
      [PROMISE]: (async function() {
        const { code, mappings } = await prettyPrint({
          source,
          sourceText,
          url
        });

        await sourceMaps.applySourceMap(source.id, url, code, mappings);

        let frames = getFrames(getState());
        if (frames) {
          frames = await updateFrameLocations(frames.toJS(), sourceMaps);
        }

        dispatch(selectSource(originalSource.id));

        return { text: code, contentType: "text/javascript", frames };
      })()
    });
  };
}

export function toggleBlackBox(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { isBlackBoxed, id } = source;

    return dispatch({
      type: constants.BLACKBOX,
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
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    // Fetch the source text only once.
    let textInfo = getSourceText(getState(), source.id);
    if (textInfo) {
      // It's already loaded or is loading
      return Promise.resolve(textInfo);
    }

    return dispatch({
      type: constants.LOAD_SOURCE_TEXT,
      source: source,
      [PROMISE]: (async function() {
        if (sourceMaps.isOriginalId(source.id)) {
          return await sourceMaps.getOriginalSourceText(source);
        }

        const response = await client.sourceContents(source.id);

        const sourceText: SourceText = {
          id: source.id,
          text: response.source,
          contentType: response.contentType || "text/javascript"
        };

        return sourceText;
        // Automatically pretty print if enabled and the test is
        // detected to be "minified"
        // if (Prefs.autoPrettyPrint &&
        //     !source.isPrettyPrinted &&
        //     SourceUtils.isMinified(source.id, response.source)) {
        //   dispatch(togglePrettyPrint(source));
        // }
      })()
    });
  };
}

// delay is in ms
const FETCH_SOURCE_RESPONSE_DELAY = 200;

/**
 * Starts fetching all the sources, silently.
 *
 * @memberof actions/sources
 * @static
 * @param array actors
 *        The urls for the sources to fetch. If fetching a source's text
 *        takes too long, it will be discarded.
 * @returns {Promise}
 *         A promise that is resolved after source texts have been fetched.
 */
export function getTextForSources(actors: any[]) {
  return ({ dispatch, getState }: ThunkArgs) => {
    let deferred = defer();
    let pending = new Set(actors);
    type FetchedSourceType = [any, string, string];
    let fetched: FetchedSourceType[] = [];

    // Can't use promise.all, because if one fetch operation is rejected, then
    // everything is considered rejected, thus no other subsequent source will
    // be getting fetched. We don't want that. Something like Q's allSettled
    // would work like a charm here.
    // Try to fetch as many sources as possible.
    for (let actor of actors) {
      let source = getSource(getState(), actor);
      dispatch(loadSourceText(source)).then(
        ({ text, contentType }) => {
          onFetch([source, text, contentType]);
        },
        err => {
          onError(source, err);
        }
      );
    }

    setTimeout(onTimeout, FETCH_SOURCE_RESPONSE_DELAY);

    /* Called if fetching a source takes too long. */
    function onTimeout() {
      pending = new Set();
      maybeFinish();
    }

    /* Called if fetching a source finishes successfully. */
    function onFetch([aSource, aText, aContentType]: FetchedSourceType) {
      // If fetching the source has previously timed out, discard it this time.
      if (!pending.has(aSource.actor)) {
        return;
      }
      pending.delete(aSource.actor);
      fetched.push([aSource.actor, aText, aContentType]);
      maybeFinish();
    }

    /* Called if fetching a source failed because of an error. */
    function onError([aSource, aError]) {
      pending.delete(aSource.actor);
      maybeFinish();
    }

    /* Called every time something interesting
     *  happens while fetching sources.
     */
    function maybeFinish() {
      if (pending.size == 0) {
        // Sort the fetched sources alphabetically by their url.
        if (deferred) {
          deferred.resolve(
            fetched.sort(([aFirst], [aSecond]) => (aFirst > aSecond ? -1 : 1))
          );
        }
      }
    }

    return deferred.promise;
  };
}
