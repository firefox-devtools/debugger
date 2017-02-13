// @flow

const buildQuery = require("./build-query");
const findIndex = require("lodash/findIndex");

import type { SearchModifiers } from "../../types";

/**
 * @memberof utils/source-search
 * @static
 */
function SearchState() {
  this.posFrom = this.posTo = this.query = null;
  this.overlay = null;
  this.results = [];
  this.matchIndex = -1;
}

/**
 * @memberof utils/source-search
 * @static
 */
function getSearchState(cm: any) {
  return cm.state.search || (cm.state.search = new SearchState());
}

/**
 * @memberof utils/source-search
 * @static
 */
function getSearchCursor(cm, query: string, pos, modifiers: SearchModifiers) {
  const regexQuery = buildQuery(query, modifiers, { isGlobal: true });
  return cm.getSearchCursor(regexQuery, pos);
}

function isWhitespace(query) {
  return !query.match(/\S/);
}

/**
 * This returns a mode object used by CoeMirror's addOverlay function
 * to parse and style tokens in the file.
 * The mode object contains a tokenizer function (token) which takes
 * a character stream as input, advances it a character at a time,
 * and returns style(s) for that token. For more details see
 * https://codemirror.net/doc/manual.html#modeapi
 *
 * Also the token function code is mainly based of work done
 * by the chrome devtools team. Thanks guys! :)
 *
 * @memberof utils/source-search
 * @static
 */
function searchOverlay(query, modifiers) {
  const regexQuery = buildQuery(query, modifiers, {
    ignoreSpaces: true
  });

  let matchLength = null;

  return {
    token: function(stream) {
      if (stream.column() === 0) {
        matchLength = null;
      }
      if (matchLength !== null) {
        if (matchLength > 2) {
          for (let i = 0; i < matchLength - 2; ++i) {
            stream.next();
          }
          matchLength = 1;
          return "highlight";
        }
        stream.next();
        matchLength = null;
        return "highlight highlight-end";
      }

      const match = stream.match(regexQuery, false);
      if (match) {
        stream.next();
        const len = match[0].length;
        if (len === 1) {
          return "highlight highlight-full";
        }
        matchLength = len;
        return "highlight highlight-start";
      }
      while (!stream.match(query, false) && stream.peek()) {
        stream.next();
      }
    }
  };
}

/**
 * @memberof utils/source-search
 * @static
 */
function updateOverlay(cm, state, query, modifiers) {
  cm.removeOverlay(state.overlay);
  state.overlay = searchOverlay(query, modifiers);
  cm.addOverlay(state.overlay, { opaque: false });
}

function updateCursor(cm, state, keepSelection) {
  state.posTo = cm.getCursor("anchor");
  state.posFrom = cm.getCursor("head");

  if (!keepSelection) {
    state.posTo = { line: 0, ch: 0 };
    state.posFrom = { line: 0, ch: 0 };
  }
}

/**
 * If there's a saved search, selects the next results.
 * Otherwise, creates a new search and selects the first
 * result.
 *
 * @memberof utils/source-search
 * @static
 */
function doSearch(ctx, rev, query, keepSelection, modifiers: SearchModifiers) {
  let { cm } = ctx;
  let matchIndex;
  cm.operation(function() {
    if (!query || isWhitespace(query)) {
      return;
    }

    let state = getSearchState(cm);
    state.query = query;

    updateOverlay(cm, state, query, modifiers);
    updateCursor(cm, state, keepSelection);

    const nextMatch = searchNext(ctx, rev, modifiers);

    if (nextMatch) {
      if (state.matchIndex === -1) {
        state.matchIndex = findIndex(state.results, nextMatch);
      } else {
        state.matchIndex = rev ? state.matchIndex - 1 : state.matchIndex + 1;
      }
      matchIndex = (state.matchIndex + state.results.length) % state.results.length;
    }
  });
  return matchIndex;
}

/**
 * Selects the next result of a saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function searchNext(ctx, rev, modifiers) {
  let { cm, ed } = ctx;
  let nextMatch;
  cm.operation(function() {
    let state = getSearchState(cm);
    const pos = rev ? state.posTo : state.posFrom;
    let cursor = getSearchCursor(
      cm,
      state.query,
      pos,
      modifiers
    );

    const location = rev
      ? { line: cm.lastLine(), ch: null }
      : { line: cm.firstLine(), ch: 0 };

    if (!cursor.find(rev)) {
      cursor = getSearchCursor(
        cm,
        state.query,
        location,
        modifiers
      );
      if (!cursor.find(rev)) {
        return;
      }
    }

    // We don't want to jump the editor
    // when we're selecting text
    if (!cm.state.selectingText) {
      ed.alignLine(cursor.from().line, "center");
      cm.setSelection(cursor.from(), cursor.to());
    }

    nextMatch = { from: cursor.from(), to: cursor.to() };
  });
  return nextMatch;
}

/**
 * Remove overlay.
 *
 * @memberof utils/source-search
 * @static
 */
function removeOverlay(ctx: any) {
  let state = getSearchState(ctx.cm);
  ctx.cm.removeOverlay(state.overlay);
}

/**
 * Clears the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function clearSearch(cm) {
  let state = getSearchState(cm);

  state.resultSet = [];
  state.matchIndex = -1;

  if (!state.query) {
    return;
  }
  cm.removeOverlay(state.overlay);
  state.query = null;
}

/**
 * Starts a new search.
 *
 * @memberof utils/source-search
 * @static
 */
function find(
  ctx: any, query: string, keepSelection: boolean, modifiers: SearchModifiers) {
  clearSearch(ctx.cm);
  return doSearch(ctx, false, query, keepSelection, modifiers);
}

/**
 * Finds the next item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findNext(
  ctx: any, query: string, keepSelection: boolean, modifiers: SearchModifiers) {
  return doSearch(ctx, false, query, keepSelection, modifiers);
}

/**
 * Finds the previous item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findPrev(
  ctx: any, query: string, keepSelection :boolean, modifiers: SearchModifiers) {
  return doSearch(ctx, true, query, keepSelection, modifiers);
}

function countMatches(
  ctx: any, query: string, text: string, modifiers: SearchModifiers): number {

  if (!query || isWhitespace(query)) {
    return;
  }

  let state = getSearchState(ctx.cm);
  let cursor = getSearchCursor(ctx.cm, query, null, modifiers);
  state.results = [];
  while (cursor.findNext()) {
    state.results.push(cursor.pos);
  }
  return state.results.length;
}

module.exports = {
  buildQuery,
  countMatches,
  find,
  findNext,
  findPrev,
  removeOverlay
};
