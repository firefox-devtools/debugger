/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const { Map, fromJS } = require("immutable");

const initialState = fromJS({
  sources: {},
  sourceTree: [],
  selectedSource: null,
  selectedSourceOpts: null,
  sourcesText: {}
});

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_SOURCE:
      return updateSourceTree(
        state.mergeIn(["sources", action.source.actor],
                      _updateSource(action.source))
      );

    case constants.LOAD_SOURCES:
      if (action.status === "done") {
        const sources = action.value;
        if (!sources) {
          return state;
        }

        return updateSourceTree(
          state.mergeIn(
            ["sources"],
            fromJS(sources.map(source => {
              return [source.actor, _updateSource(source)];
            }))
          )
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

    case constants.NAVIGATE:
      // Reset the entire state to just the initial state, a blank state
      // if you will.
      return initialState;
  }

  return state;
}

function isSource(obj) {
  return obj.get && !!obj.get("actor");
}

function compileToTree(parent, items, depth = 0) {
  const children = items.groupBy(item => {
    if(depth < item.path.length) {
      return item.path[depth];
    }
    return '(index)';
  }).entrySeq().map(([k, arr]) => {
    if(arr.count() > 1 || depth < arr.get(0).path.length - 1) {
      return compileToTree(k, arr, depth + 1);
    }
    return [k, arr.get(0).source];
  }).toArray();

  return [parent, children];
}

function updateSourceTree(state) {
  const sources = state.get("sources").valueSeq().filter(source => {
    return !!source.get("url");
  }).map(source => {
    const url = new URL(source.get("url"));
    const paths = url.pathname.split("/").filter(p => p !== "");
    paths.unshift(url.host);

    return {
      source: source,
      path: paths
    }
  })

  const tree = compileToTree("root", sources);
  return state.set("sourceTree", tree);
}

function _updateSource(source) {
  const pathname = getPathname(source.url);
  const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
  return Object.assign({}, source, { pathname, filename });
}

function getPathname(url) {
  if (!url) {
    return "";
  }

  if (typeof URL !== "undefined") {
    return new URL(url).pathname;
  }

  return require("url").parse(url).pathname;
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
