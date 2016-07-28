/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const defer = require("../utils/defer");
const { PROMISE } = require("../utils/redux/middleware/promise");
const { Task } = require("../utils/task");
const { isJavaScript } = require("../utils/source");
const { networkRequest } = require("../utils/networkRequest");
const { workerTask } = require("../utils/utils");

const constants = require("../constants");
const invariant = require("invariant");
const { isEnabled } = require("../feature");

const { createOriginalSources, getOriginalTexts,
        createSourceMap, makeOriginalSource } = require("../utils/source-map");

const { getSource, getSourceText, getSourceByURL, getGeneratedSource,
        getSourceMap, getSourceMapURL, getOriginalSources
      } = require("../selectors");

function _shouldSourceMap(generatedSource) {
  return isEnabled("features.sourceMaps") && generatedSource.sourceMapURL;
}

function _getOriginalSourceTexts(state, generatedSource, generatedText) {
  if (!_shouldSourceMap(generatedSource)) {
    return [];
  }

  return getOriginalTexts(
    generatedSource,
    generatedText
  ).map(({ text, url }) => {
    const id = getSourceByURL(state, url).get("id");
    const contentType = "text/javascript";
    return { text, id, contentType };
  });
}

function _addSource(source) {
  return {
    type: constants.ADD_SOURCE,
    source
  };
}

async function _prettyPrintSource({ source, sourceText }) {
  if (!isEnabled("features.prettyPrint")) {
    return {};
  }

  const contentType = sourceText ? sourceText.contentType : null;
  const indent = 2;
  const url = source.url + ":formatted";

  invariant(
    isJavaScript(source.url, contentType),
    "Can't prettify non-javascript files."
  );

  const { code, mappings } = await workerTask(
    new Worker("js/utils/pretty-print-worker.js"),
    {
      url,
      indent,
      source: sourceText.text
    }
  );

  let originalSource = makeOriginalSource({
    url,
    generatedSource: source,
    text: { text: code, contentType }
  });

  createSourceMap({ source, mappings, code });

  return originalSource;
}

/**
 * Handler for the debugger client's unsolicited newSource notification.
 */
function newSource(source) {
  return ({ dispatch, getState }) => {
    if (_shouldSourceMap(source)) {
      dispatch(loadSourceMap(source));
    }

    dispatch(_addSource(source));
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

        createOriginalSources(generatedSource, sourceMap)
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

    if (source.isPrettyPrinted) {
      return {};
    }

    return dispatch({
      type: constants.TOGGLE_PRETTY_PRINT,
      source: source,
      [PROMISE]: (async function () {
        const sourceText = getSourceText(getState(), source.id).toJS();
        const originalSource = await _prettyPrintSource({ source, sourceText });
        dispatch(_addSource(originalSource));
        dispatch(selectSource(originalSource.id));

        return {
          isPrettyPrinted: true
        };
      })()
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
    const generatedSource = getGeneratedSource(getState(), source);
    const originalSources = getOriginalSources(getState(), generatedSource)
                            .map(s => s.toJS());

    return dispatch({
      type: constants.LOAD_SOURCE_TEXT,
      generatedSource: generatedSource,
      originalSources: originalSources,
      [PROMISE]: Task.spawn(function* () {
        const response = yield client.sourceContents(
          generatedSource.id
        );

        const generatedSourceText = {
          text: response.source,
          contentType: response.contentType || "text/javascript",
          id: generatedSource.id
        };

        const originalSourceTexts = _getOriginalSourceTexts(
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
