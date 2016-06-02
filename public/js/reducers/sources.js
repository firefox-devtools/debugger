/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const fromJS = require("../util/fromJS");
const { Map } = require("immutable");

const initialState = fromJS({
  sources: {},
  sourceTree: ["root", []],
  selectedSource: null,
  sourcesText: {}
});

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_SOURCE:
      return state.mergeIn(["sources", action.source.id], action.source);

    case constants.ADD_SOURCES:
      return state.mergeIn(
        ["sources"],
        Map(action.sources.map(source => {
          return [source.id, fromJS(_updateSource(source))];
        }))
      );

    case constants.SELECT_SOURCE:
      return state.merge({
        selectedSource: action.source
      });

    case constants.LOAD_SOURCE_TEXT: {
      return _updateText(state, action);
    }

    case constants.BLACKBOX:
      if (action.status === "done") {
        return state.setIn(
          ["sources", action.source.id, "isBlackBoxed"],
          action.value.isBlackBoxed
        );
      }
      break;

    case constants.TOGGLE_PRETTY_PRINT:
      if (action.status === "error") {
        return state.mergeIn(["sourcesText", action.source.id], {
          loading: false
        });
      }

      let s = _updateText(state, action);
      if (action.status === "done") {
        s = s.setIn(
          ["sources", action.source.id, "isPrettyPrinted"],
          action.value.isPrettyPrinted
        );
      }
      return s;

    case constants.NAVIGATE:
      // Reset the entire state to just the initial state, a blank state
      // if you will.
      return initialState;
  }

  return state;
}

function _updateText(state, action) {
  const { source } = action;

  if (action.status === "start") {
    // Merge this in, don't set it. That way the previous value is
    // still stored here, and we can retrieve it if whatever we're
    // doing fails.
    return state.mergeIn(["sourcesText", source.id], {
      loading: true
    });
  } else if (action.status === "error") {
    return state.setIn(["sourcesText", source.id], Map({
      error: action.error
    }));
  }

  return state.setIn(["sourcesText", source.id], Map({
    text: action.value.text,
    contentType: action.value.contentType
  }));
}

module.exports = update;
