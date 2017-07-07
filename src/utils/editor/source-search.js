// @flow

import buildQuery from "../search/build-query";

import type { SearchModifiers } from "../../types";

/**
 * @memberof utils/source-search
 * @static
 */
function getSearchCursor(cm, query: string, pos, modifiers: SearchModifiers) {
  const regexQuery = buildQuery(query, modifiers, { isGlobal: true });
  return cm.getSearchCursor(regexQuery, pos);
}

/**
 * @memberof utils/source-search
 * @static
 */
function SearchState() {
  this.posFrom = this.posTo = this.query = null;
  this.overlay = null;
  this.results = [];
}

/**
 * @memberof utils/source-search
 * @static
 */
function getSearchState(cm: any, query, modifiers) {
  let state = cm.state.search || (cm.state.search = new SearchState());
  return state;
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
      while (!stream.match(regexQuery, false) && stream.peek()) {
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

function getMatchIndex(count: number, currentIndex: number, rev: boolean) {
  if (!rev) {
    if (currentIndex == count - 1) {
      return 0;
    }

    return currentIndex + 1;
  }

  if (currentIndex == 0) {
    return count - 1;
  }

  return currentIndex - 1;
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
  const { cm } = ctx;
  if (!cm) {
    return;
  }
  const defaultIndex = { line: -1, ch: -1 };

  return cm.operation(function() {
    if (!query || isWhitespace(query)) {
      return;
    }

    const state = getSearchState(cm, query, modifiers);
    const isNewQuery = state.query !== query;
    state.query = query;

    updateOverlay(cm, state, query, modifiers);
    updateCursor(cm, state, keepSelection);
    const searchLocation = searchNext(ctx, rev, query, isNewQuery, modifiers);

    return searchLocation ? searchLocation.from : defaultIndex;
  });
}

function getCursorPos(newQuery, rev, state) {
  if (newQuery) {
    return rev ? state.posFrom : state.posTo;
  }

  return rev ? state.posTo : state.posFrom;
}

/**
 * Selects the next result of a saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function searchNext(ctx, rev, query, newQuery, modifiers) {
  let { cm, ed } = ctx;
  let nextMatch;
  cm.operation(function() {
    let state = getSearchState(cm, query, modifiers);
    const pos = getCursorPos(newQuery, rev, state);

    if (!state.query) {
      return;
    }

    let cursor = getSearchCursor(cm, state.query, pos, modifiers);

    const location = rev
      ? { line: cm.lastLine(), ch: null }
      : { line: cm.firstLine(), ch: 0 };

    if (!cursor.find(rev) && state.query) {
      cursor = getSearchCursor(cm, state.query, location, modifiers);
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
function removeOverlay(ctx: any, query: string, modifiers: SearchModifiers) {
  let state = getSearchState(ctx.cm, query, modifiers);
  ctx.cm.removeOverlay(state.overlay);
  const { line, ch } = ctx.cm.getCursor();
  ctx.cm.doc.setSelection({ line, ch }, { line, ch }, { scroll: false });
}

/**
 * Clears the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function clearSearch(cm, query: string, modifiers: SearchModifiers) {
  let state = getSearchState(cm, query, modifiers);

  state.results = [];

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
  ctx: any,
  query: string,
  keepSelection: boolean,
  modifiers: SearchModifiers
) {
  clearSearch(ctx.cm, query, modifiers);
  return doSearch(ctx, false, query, keepSelection, modifiers);
}

/**
 * Finds the next item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findNext(
  ctx: any,
  query: string,
  keepSelection: boolean,
  modifiers: SearchModifiers
) {
  return doSearch(ctx, false, query, keepSelection, modifiers);
}

/**
 * Finds the previous item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findPrev(
  ctx: any,
  query: string,
  keepSelection: boolean,
  modifiers: SearchModifiers
) {
  return doSearch(ctx, true, query, keepSelection, modifiers);
}

export { buildQuery, find, findNext, findPrev, removeOverlay, getMatchIndex };
