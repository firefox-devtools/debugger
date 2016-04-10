/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const Immutable = require("seamless-immutable");
const { mergeIn, setIn } = require("../utils");

const initialState = Immutable({
  sources: {},
  selectedSource: null,
  selectedSourceOpts: null,
  sourcesText: {}
});

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_SOURCE:
      return mergeIn(state, ["sources", action.source.actor], action.source);

    case constants.LOAD_SOURCES:
      if (action.status === "done") {
        const sources = action.value;
        if (!sources) {
          return state;
        }
        const sourcesByActor = {};
        sources.forEach(source => {
          sourcesByActor[source.actor] = source;
        });
        return mergeIn(state, ["sources"], state.sources.merge(sourcesByActor));
      }
      break;

    case constants.SELECT_SOURCE:
      return state.merge({
        selectedSource: action.source.actor,
        selectedSourceOpts: action.opts
      });

    case constants.LOAD_SOURCE_TEXT: {
      const s = _updateText(state, action);
      return s;
    }

    case constants.BLACKBOX:
      if (action.status === "done") {
        return mergeIn(state,
                     ["sources", action.source.actor, "isBlackBoxed"],
                     action.value.isBlackBoxed);
      }
      break;

    case constants.TOGGLE_PRETTY_PRINT:
      let s = state;
      if (action.status === "error") {
        s = mergeIn(state, ["sourcesText", action.source.actor], {
          loading: false
        });
      }
      else {
        s = _updateText(state, action);

        if (action.status === "done") {
          s = mergeIn(s,
                    ["sources", action.source.actor, "isPrettyPrinted"],
                    action.value.isPrettyPrinted);
        }
      }
      return s;

    case constants.UNLOAD:
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
    return mergeIn(state, ["sourcesText", source.actor], {
      loading: true
    });
  }
  else if (action.status === "error") {
    return setIn(state, ["sourcesText", source.actor], {
      error: action.error
    });
  }
  else {
    return setIn(state, ["sourcesText", source.actor], {
      text: action.value.text,
      contentType: action.value.contentType
    });
  }
}

module.exports = update;
