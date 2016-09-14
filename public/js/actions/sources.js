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
const { isJavaScript } = require("../utils/source");
const { networkRequest } = require("../utils/networkRequest");
const { workerTask } = require("../utils/utils");
const { updateFrameLocations } = require("../utils/pause");

const constants = require("../constants");
const invariant = require("invariant");
const { isEnabled } = require("../feature");

const {
  createOriginalSources, getOriginalSourceTexts,
  createSourceMap, makeOriginalSource,
  getGeneratedSource
} = require("../utils/source-map");

const {
  getSource, getSourceByURL, getSourceText,
  getPendingSelectedLocation,
  getSourceMap, getSourceMapURL, getFrames
} = require("../selectors");

function _shouldSourceMap(generatedSource) {
  return isEnabled("sourceMaps") && generatedSource.sourceMapURL;
}

function _addSource(source) {
  return {
    type: constants.ADD_SOURCE,
    source
  };
}

async function _prettyPrintSource({ source, sourceText, url }) {
  const contentType = sourceText ? sourceText.contentType : null;
  const indent = 2;

  invariant(
    isJavaScript(source.url, contentType),
    "Can't prettify non-javascript files."
  );

  const { code, mappings } = await workerTask(
    new Worker("public/build/pretty-print-worker.js"),
    {
      url,
      indent,
      source: sourceText.text
    }
  );

  await createSourceMap({ source, mappings, code });

  return code;
}

/**
 * Handler for the debugger client's unsolicited newSource notification.
 * @memberof actions/sources
 * @static
 */
function newSource(source) {
  return ({ dispatch, getState }) => {
    if (_shouldSourceMap(source)) {
      dispatch(loadSourceMap(source));
    }

    dispatch(_addSource(source));

    // If a request has been made to show this source, go ahead and
    // select it.
    const pendingLocation = getPendingSelectedLocation(getState());
    if (pendingLocation && pendingLocation.url === source.url) {
      dispatch(selectSource(source.id, pendingLocation.line));
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function loadSourceMap(generatedSource) {
  return ({ dispatch, getState }) => {
    let sourceMap = getSourceMap(getState(), generatedSource.id);
    if (sourceMap) {
      return;
    }

    dispatch({
      type: constants.LOAD_SOURCE_MAP,
      source: generatedSource,
      [PROMISE]: (async function () {
        const sourceMapURL = getSourceMapURL(getState(), generatedSource);
        sourceMap = await networkRequest(sourceMapURL);

        const originalSources = await createOriginalSources(
          generatedSource,
          sourceMap
        );

        originalSources.forEach(s => dispatch(newSource(s)));

        return { sourceMap };
      })()
    });
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
function togglePrettyPrint(id) {
  return ({ dispatch, getState, client }) => {
    const source = getSource(getState(), id).toJS();
    const sourceText = getSourceText(getState(), id).toJS();

    if (sourceText.loading) {
      return;
    }

    if (!isEnabled("prettyPrint") || source.isPrettyPrinted) {
      return {};
    }

    const url = source.url + ":formatted";
    const originalSource = makeOriginalSource({ url, source });
    dispatch(_addSource(originalSource));

    return dispatch({
      type: constants.TOGGLE_PRETTY_PRINT,
      source,
      originalSource,
      [PROMISE]: (async function () {
        const state = getState();
        const text = await _prettyPrintSource({ source, sourceText, url });
        const frames = await updateFrameLocations(state, getFrames(state));

        dispatch(selectSource(originalSource.id));

        const originalSourceText = {
          id: originalSource.id,
          contentType: "text/javascript",
          text
        };

        return {
          isPrettyPrinted: true,
          sourceText: originalSourceText,
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
        const generatedSource = await getGeneratedSource(
          getState(),
          source
        );

        const response = await client.sourceContents(
          generatedSource.id
        );

        const generatedSourceText = {
          text: response.source,
          contentType: response.contentType || "text/javascript",
          id: generatedSource.id
        };

        const originalSourceTexts = await getOriginalSourceTexts(
          getState(),
          generatedSource,
          generatedSourceText.text
        );

        // Automatically pretty print if enabled and the test is
        // detected to be "minified"
        // if (Prefs.autoPrettyPrint &&
        //     !source.isPrettyPrinted &&
        //     SourceUtils.isMinified(source.id, response.source)) {
        //   dispatch(togglePrettyPrint(source));
        // }

        return {
          generatedSourceText,
          originalSourceTexts
        };
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
  selectSource,
  selectSourceURL,
  closeTab,
  blackbox,
  togglePrettyPrint,
  loadSourceText,
  getTextForSources
};
