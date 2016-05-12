/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const { Map, List, fromJS } = require("immutable");
const Cursor = require("../util/cursor");
const { pathName, pathHasChildren, pathContents } = require("../selectors");

const initialState = fromJS({
  sources: {},
  sourceTree: ["root", []],
  selectedSource: null,
  selectedSourceOpts: null,
  sourcesText: {}
});

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_SOURCE:
      return addToSourceTree(
        state,
        fromJS(_updateSource(action.source))
      );

    case constants.LOAD_SOURCES:
      if (action.status === "done") {
        // const sources = action.value;
        // if (!sources) {
        //   return state;
        // }

        // return updateSourceTree(
        //   state.mergeIn(
        //     ["sources"],
        //     fromJS(sources.map(source => {
        //       return [source.actor, _updateSource(source)];
        //     }))
        //   )
        // );
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

function setPathContents(item, contents) {
  return item.set(1, contents);
}

function createPath(name, contents) {
  return fromJS([name, contents]);
}

function addToSourceTree(state, source) {
  if(!source.get("url")) {
    return state;
  }

  const start = Date.now();

  const url = new URL(source.get("url"));
  const parts = url.pathname.split("/").filter(p => p !== "");
  parts.unshift(url.host);
  const isDir = parts[parts.length - 1].indexOf(".") === -1;

  let tree = state.get("sourceTree");
  let cursor = Cursor.from(tree, newTree => {
    tree = newTree
  });

  for(let part of parts) {
    const subpaths = cursor.get(1);
    let idx = subpaths.findIndex(subpath => {
      return pathName(subpath).localeCompare(part) >= 0;
    });

    const pathItem = createPath(part, []);

    if(idx >= 0 && pathName(subpaths.get(idx)) === part) {
      cursor = subpaths.get(idx);
    } else {
      // Add a new one
      const where = idx === -1 ? subpaths.size : idx;
      cursor = subpaths.splice(where, 0, pathItem).get(where);
    }
  }

  if(isDir) {
    setPathContents(cursor, List([createPath("(index)", source)]));
  }
  else {
    setPathContents(cursor, source);
  }

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
