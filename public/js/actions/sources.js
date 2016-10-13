/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

const defer = require("../utils/defer");
const { PROMISE } = require("../utils/redux/middleware/promise");
const { Task } = require("../utils/task");
const assert = require("../utils/assert");
const { updateFrameLocations } = require("../utils/pause");
const {
  getOriginalURLs, getOriginalSourceText,
  generatedToOriginalId, isOriginalId,
  isGeneratedId, applySourceMap
} = require("../utils/source-map");
const { prettyPrint } = require("../utils/pretty-print");

const constants = require("../constants");
const { isEnabled } = require("devtools-config");
const { removeDocument } = require("../utils/source-documents");

const {
  getSource, getSourceByURL, getSourceText,
  getPendingSelectedLocation, getFrames
} = require("../selectors");

/**
 * Handler for the debugger client's unsolicited newSource notification.
 * @memberof actions/sources
 * @static
 */
function newSource(source) {
  return ({ dispatch, getState }) => {
    if (isEnabled("sourceMaps")) {
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

function newSources(sources) {
  return ({ dispatch, getState }) => {
    sources.filter(source => !getSource(getState(), source.id))
      .forEach(source => dispatch(newSource(source)));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function loadSourceMap(generatedSource) {
  return async function({ dispatch, getState }) {
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

/**
 * Deterministically select a source that has a given URL. This will
 * work regardless of the connection status or if the source exists
 * yet. This exists mostly for external things to interact with the
 * debugger.
 *
 * @memberof actions/sources
 * @static
 */
function selectSourceURL(url, options = {}) {
  return ({ dispatch, getState }) => {
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
function selectSource(id, options = {}) {
  return ({ dispatch, getState, client }) => {
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), id).toJS();

    // Make sure to start a request to load the source text.
    dispatch(loadSourceText(source));

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
function closeTab(id) {
  removeDocument(id);
  return {
    type: constants.CLOSE_TAB,
    id: id,
  };
}

/**
 * Set the black boxed status of the given source.
 *
 * @memberof actions/sources
 * @static
 * @param Object source
 *        The source form.
 * @param bool shouldBlackBox
 *        True to black box the source, false to un-black box it.
 * @returns {Promise}
 *          A promize that resolves to [aSource, isBlackBoxed] or rejects to
 *          [aSource, error].
 */
function blackbox(source, shouldBlackBox) {
  return ({ dispatch, client }) => {
    dispatch({
      type: constants.BLACKBOX,
      source: source,
      [PROMISE]: Task.spawn(function* () {
        yield shouldBlackBox ?
          client.blackBox(source.id) :
          client.unblackBox(source.id);
        return {
          isBlackBoxed: shouldBlackBox
        };
      })
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
function togglePrettyPrint(sourceId) {
  return ({ dispatch, getState, client }) => {
    const source = getSource(getState(), sourceId).toJS();
    const sourceText = getSourceText(getState(), sourceId).toJS();

    if (!isEnabled("prettyPrint") || sourceText.loading) {
      return {};
    }

    assert(isGeneratedId(sourceId),
           "Pretty-printing only allowed on generated sources");

    const url = source.url + ":formatted";
    const id = generatedToOriginalId(source.id, url);
    const originalSource = { url, id, isPrettyPrinted: false };
    dispatch({
      type: constants.ADD_SOURCE,
      source: originalSource
    });

    return dispatch({
      type: constants.TOGGLE_PRETTY_PRINT,
      source: originalSource,
      [PROMISE]: (async function () {
        const { code, mappings } = await prettyPrint({
          source, sourceText, url
        });
        applySourceMap(source.id, url, code, mappings);

        const frames = await updateFrameLocations(getFrames(getState()));
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
function loadSourceText(source) {
  return ({ dispatch, getState, client }) => {
    // Fetch the source text only once.
    let textInfo = getSourceText(getState(), source.id);
    if (textInfo) {
      // It's already loaded or is loading
      return Promise.resolve(textInfo);
    }

    return dispatch({
      type: constants.LOAD_SOURCE_TEXT,
      source: source,
      [PROMISE]: (async function () {
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
function getTextForSources(actors) {
  return ({ dispatch, getState }) => {
    let deferred = defer();
    let pending = new Set(actors);
    let fetched = [];

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
    function onFetch([aSource, aText, aContentType]) {
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
        deferred.resolve(
          fetched.sort(([aFirst], [aSecond]) => aFirst > aSecond));
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
  closeTab,
  blackbox,
  togglePrettyPrint,
  loadSourceText,
  getTextForSources
};
