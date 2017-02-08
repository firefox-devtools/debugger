// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

const defer = require("../utils/defer");
const { PROMISE } = require("../utils/redux/middleware/promise");
const assert = require("../utils/assert");
const { updateFrameLocations } = require("../utils/pause");
const {
  getOriginalURLs, getOriginalSourceText,
  generatedToOriginalId, isOriginalId,
  getOriginalLocation, getGeneratedLocation,
  isGeneratedId, applySourceMap, shouldSourceMap
} = require("../utils/source-map");

const { prettyPrint } = require("../utils/pretty-print");
const { getPrettySourceURL } = require("../utils/source");

const constants = require("../constants");
const { removeDocument } = require("../utils/editor/source-documents");

const {
  getSource, getSourceByURL, getSourceText,
  getPendingSelectedLocation, getFrames
} = require("../selectors");

import type { Source } from "../types";
import type { ThunkArgs } from "./types";

/**
 * Handler for the debugger client's unsolicited newSource notification.
 * @memberof actions/sources
 * @static
 */
function newSource(source: Source) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (shouldSourceMap()) {
      dispatch(loadSourceMap(source));
    }

    dispatch({
      type: constants.ADD_SOURCE,
      source
    });

    // If a request has been made to show this source, go ahead and
    // select it.
    const pendingLocation = getPendingSelectedLocation(getState());
    if (pendingLocation && pendingLocation.url === source.url) {
      dispatch(selectSource(source.id, { line: pendingLocation.line }));
    }
  };
}

function newSources(sources: Source[]) {
  return ({ dispatch, getState }: ThunkArgs) => {
    sources.filter(source => !getSource(getState(), source.id))
      .forEach(source => dispatch(newSource(source)));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function loadSourceMap(generatedSource) {
  return async function({ dispatch, getState }: ThunkArgs) {
    const urls = await getOriginalURLs(generatedSource);
    if (!urls) {
      // If this source doesn't have a sourcemap, do nothing.
      return;
    }

    const originalSources = urls.map(originalUrl => {
      return {
        url: originalUrl,
        id: generatedToOriginalId(generatedSource.id, originalUrl),
        isPrettyPrinted: false
      };
    });

    originalSources.forEach(s => dispatch(newSource(s)));
  };
}

type SelectSourceOptions = {
  tabIndex?: number,
  line?: number
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
function selectSourceURL(url: string, options: SelectSourceOptions = {}) {
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
function selectSource(id: string, options: SelectSourceOptions = {}) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), id).toJS();

    // Make sure to start a request to load the source text.
    dispatch(loadSourceText(source));

    dispatch({ type: constants.SET_FILE_SEARCH, searchOn: false });

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
function jumpToMappedLocation(sourceLocation: any) {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    if (!client) {
      return;
    }

    const source = getSource(getState(), sourceLocation.sourceId);
    const pairedLocation = isOriginalId(sourceLocation.sourceId)
      ? await getGeneratedLocation(sourceLocation, source.toJS())
      : await getOriginalLocation(sourceLocation, source.toJS());

    return dispatch(selectSource(
      pairedLocation.sourceId,
      { line: pairedLocation.line }
    ));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function closeTab(url: string) {
  removeDocument(url);
  return {
    type: constants.CLOSE_TAB,
    url
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function closeTabs(urls: string[]) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    urls.forEach(url => {
      const source = getSourceByURL(getState(), url);
      if (source) {
        removeDocument(source.get("id"));
      }
    });

    dispatch({
      type: constants.CLOSE_TABS,
      urls
    });
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
function togglePrettyPrint(sourceId: string) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    const source = getSource(getState(), sourceId).toJS();
    const sourceText = getSourceText(getState(), sourceId).toJS();

    if (sourceText.loading) {
      return {};
    }

    assert(isGeneratedId(sourceId),
           "Pretty-printing only allowed on generated sources");

    const url = getPrettySourceURL(source.url);
    const id = generatedToOriginalId(source.id, url);
    const originalSource = { url, id, isPrettyPrinted: false };
    dispatch({
      type: constants.ADD_SOURCE,
      source: originalSource
    });

    return dispatch({
      type: constants.TOGGLE_PRETTY_PRINT,
      source: originalSource,
      [PROMISE]: (async function() {
        const { code, mappings } = await prettyPrint({
          source, sourceText, url
        });

        await applySourceMap(source.id, url, code, mappings);

        const frames = getFrames(getState());
        if (frames) {
          frames = await updateFrameLocations(frames.toJS());
        }

        dispatch(selectSource(originalSource.id));

        return {
          text: code,
          contentType: "text/javascript",
          frames
        };
      })()
    });
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function loadSourceText(source: Source) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
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
        if (isOriginalId(source.id)) {
          return await getOriginalSourceText(source);
        }

        const response = await client.sourceContents(source.id);
        return {
          text: response.source,
          contentType: response.contentType || "text/javascript"
        };

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
function getTextForSources(actors: any[]) {
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
      dispatch(loadSourceText(source)).then(({ text, contentType }) => {
        onFetch([source, text, contentType]);
      }, err => {
        onError(source, err);
      });
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
            fetched.sort(([aFirst], [aSecond]) => aFirst > aSecond ? -1 : 1)
          );
        }
      }
    }

    return deferred.promise;
  };
}

module.exports = {
  newSource,
  newSources,
  selectSource,
  selectSourceURL,
  jumpToMappedLocation,
  closeTab,
  closeTabs,
  togglePrettyPrint,
  loadSourceText,
  getTextForSources
};
