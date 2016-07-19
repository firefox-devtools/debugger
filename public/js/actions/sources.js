/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const defer = require("devtools/shared/defer");
const { PROMISE } = require("../util/redux/middleware/promise");
const { Task } = require("../util/task");
const { isJavaScript } = require("../util/source");
const { networkRequest } = require("../util/networkRequest");

const { getSource, getSourceText,
        getSourceMap, getSourceMapURL } = require("../selectors");
const constants = require("../constants");
const Prefs = require("../prefs");
const invariant = require("invariant");
const { isEnabled } = require("../../../config/feature");
const { setSourceMap, createOriginalSources, getGeneratedSourceId,
        isOriginal, getOriginalSource } = require("../util/source-map");

/**
 * Throttles source dispatching to reduce rendering churn.
 */
let newSources = [];
let newSourceTimeout;
function _queueSourcesDispatch(dispatch) {
  if (!newSourceTimeout) {
    // Even just batching every 10ms works because we just want to
    // group sources that come in at once.
    newSourceTimeout = setTimeout(() => {
      dispatch({ type: constants.ADD_SOURCES,
                 sources: newSources });
      newSources = [];
      newSourceTimeout = null;
    }, 10);
  }
}

function _loadOriginalSourceText(source, getState, dispatch) {
  return Task.spawn(function* () {
    const generatedSource = getSource(
      getState(),
      getGeneratedSourceId(source)
    );

    const generatedSourceText = yield dispatch(
      loadSourceText(generatedSource.toJS())
    );

    return getOriginalSource(
      source,
      generatedSource.toJS(),
      generatedSourceText
    );
  });
}

/**
 * Handler for the debugger client's unsolicited newSource notification.
 */
function newSource(source) {
  return ({ dispatch, getState }) => {
    if (isEnabled("features.sourceMaps") && source.sourceMapURL) {
      dispatch(loadSourceMap(source));
    }

    // We don't immediately dispatch the source because several
    // thousand may come in at the same time and we want to batch
    // rendering.
    newSources.push(source);
    _queueSourcesDispatch(dispatch);
  };
}

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

        setSourceMap(generatedSource, sourceMap);
        createOriginalSources(generatedSource)
          .forEach(s => dispatch(newSource(s)));

        return { sourceMap };
      })()
    });
  };
}

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
      options
    });
  };
}

function closeTab(id) {
  return {
    type: constants.CLOSE_TAB,
    id: id,
  };
}

/**
 * Set the black boxed status of the given source.
 *
 * @param Object aSource
 *        The source form.
 * @param bool aBlackBoxFlag
 *        True to black box the source, false to un-black box it.
 * @returns Promise
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
 * @param Object aSource
 *        The source form from the RDP.
 * @returns Promise
 *          A promise that resolves to [aSource, prettyText] or rejects to
 *          [aSource, error].
 */
function togglePrettyPrint(id) {
  return ({ dispatch, getState, client }) => {
    const source = getSource(getState(), id).toJS();
    const wantPretty = !source.isPrettyPrinted;

    return dispatch({
      type: constants.TOGGLE_PRETTY_PRINT,
      source: source,
      [PROMISE]: Task.spawn(function* () {
        let response;

        // Only attempt to pretty print JavaScript sources.
        const sourceText = getSourceText(getState(), source.id).toJS();
        const contentType = sourceText ? sourceText.contentType : null;

        invariant(
          isJavaScript(source.url, contentType),
          "Can't prettify non-javascript files."
        );

        if (wantPretty) {
          response = yield client.prettyPrint(source.id, Prefs.editorTabSize);
        } else {
          response = yield client.disablePrettyPrint(source.id);
        }

        // Remove the cached source AST from the Parser, to avoid getting
        // wrong locations when searching for functions.
        // TODO: add Parser dependency
        // DebuggerController.Parser.clearSource(source.url);

        return {
          isPrettyPrinted: wantPretty,
          text: response.source,
          contentType: response.contentType
        };
      })
    });
  };
}

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
      [PROMISE]: Task.spawn(function* () {
        let response = isOriginal(source)
          ? yield _loadOriginalSourceText(source, getState, dispatch)
          : yield client.sourceContents(source.id);

        // Automatically pretty print if enabled and the test is
        // detected to be "minified"
        // if (Prefs.autoPrettyPrint &&
        //     !source.isPrettyPrinted &&
        //     SourceUtils.isMinified(source.id, response.source)) {
        //   dispatch(togglePrettyPrint(source));
        // }

        return { text: response.source,
                 contentType: response.contentType };
      })
    });
  };
}

// delay is in ms
const FETCH_SOURCE_RESPONSE_DELAY = 200;

/**
 * Starts fetching all the sources, silently.
 *
 * @param array aUrls
 *        The urls for the sources to fetch. If fetching a source's text
 *        takes too long, it will be discarded.
 * @return object
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

    /** Called every time something interesting
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
  closeTab,
  blackbox,
  togglePrettyPrint,
  loadSourceText,
  getTextForSources
};
