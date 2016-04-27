/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const { Map, fromJS } = require("immutable");

const initialState = fromJS({
  sources: {},
  selectedSource: null,
  selectedSourceOpts: null,
  sourcesText: {}
});

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_SOURCE:
      let newSource = action.source;
      newSource.filename = getFilenameFromUrl(newSource.url);
      return state.mergeIn(["sources", action.source.actor], newSource);

    case constants.LOAD_SOURCES:
      if (action.status === "done") {
        const sources = action.value;
        if (!sources) {
          return state;
        }

        return state.mergeIn(
          ["sources"],
          fromJS(sources.map(source => {
            source.filename = getFilenameFromUrl(source.url);
            return [source.actor, source];
          }))
        );
      }
      break;

    case constants.SELECT_SOURCE:
      return state.merge({
        selectedSource: action.source,
        selectedSourceOpts: action.opts
      });

    case constants.LOAD_SOURCE_TEXT: {
      return _updateText(state, action);
    }

    case constants.BLACKBOX:
      if (action.status === "done") {
        return state.setIn(
          ["sources", action.source.actor, "isBlackBoxed"],
          action.value.isBlackBoxed
        );
      }
      break;

    case constants.TOGGLE_PRETTY_PRINT:
      if (action.status === "error") {
        return state.mergeIn(["sourcesText", action.source.actor], {
          loading: false
        });
      }

      let s = _updateText(state, action);
      if (action.status === "done") {
        s = s.setIn(
          ["sources", action.source.actor, "isPrettyPrinted"],
          action.value.isPrettyPrinted
        );
      }
      return s;

    case constants.UNLOAD:
      // Reset the entire state to just the initial state, a blank state
      // if you will.
      return initialState;
  }

  return state;
}

function getFilenameFromUrl(sourceUrl) {
  if (!sourceUrl) {
    return "";
  }

  const url = new URL(sourceUrl);
  return url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
}

function _updateText(state, action) {
  const { source } = action;

  if (action.status === "start") {
    // Merge this in, don't set it. That way the previous value is
    // still stored here, and we can retrieve it if whatever we're
    // doing fails.
    return state.mergeIn(["sourcesText", source.actor], {
      loading: true
    });
  } else if (action.status === "error") {
    return state.setIn(["sourcesText", source.actor], Map({
      error: action.error
    }));
  }

  return state.setIn(["sourcesText", source.actor], Map({
    text: action.value.text,
    contentType: action.value.contentType
  }));
}

module.exports = update;
