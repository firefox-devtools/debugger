const { escapeRegExp } = require("lodash");
/**
 * These functions implement search within the debugger. Since
 * search in the debugger is different from other components,
 * we can't use search.js CodeMirror addon. This is a slightly
 * modified version of that addon. Depends on searchcursor.js.
 * @module utils/source-search
 */

/**
 * @memberof utils/source-search
 * @static
 */
function SearchState() {
  this.posFrom = this.posTo = this.query = null;
  this.overlay = null;
}

/**
 * @memberof utils/source-search
 * @static
 */
function getSearchState(cm) {
  return cm.state.search || (cm.state.search = new SearchState());
}

/**
 * @memberof utils/source-search
 * @static
 */
function getSearchCursor(cm, query, pos) {
  // If the query string is all lowercase, do a case insensitive search.
  return cm.getSearchCursor(query, pos,
    typeof query == "string" && query == query.toLowerCase());
}

/**
 * Ignore doing outline matches for less than 3 whitespaces
 *
 * @memberof utils/source-search
 * @static
 */
function ignoreWhiteSpace(str) {
  return /^\s{0,2}$/.test(str) ? "(?!\s*.*)" : str;
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
function searchOverlay(query) {
  query = new RegExp(escapeRegExp(ignoreWhiteSpace(query)));
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

      const match = stream.match(query, false);
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
function startSearch(cm, state, query) {
  cm.removeOverlay(state.overlay);
  state.overlay = searchOverlay(query);
  cm.addOverlay(state.overlay, { opaque: false });
}

/**
 * If there's a saved search, selects the next results.
 * Otherwise, creates a new search and selects the first
 * result.
 *
 * @memberof utils/source-search
 * @static
 */
function doSearch(ctx, rev, query, keepSelection) {
  let { cm } = ctx;
  let state = getSearchState(cm);

  if (state.query) {
    searchNext(ctx, rev);
    return;
  }

  cm.operation(function() {
    if (state.query) {
      return;
    }
    startSearch(cm, state, query);
    state.query = query;
    if (keepSelection) {
      state.posTo = cm.getCursor("anchor");
      state.posFrom = cm.getCursor("head");
    } else {
      state.posFrom = state.posTo = { line: 0, ch: 0 };
    }
    searchNext(ctx, rev);
  });
}

/**
 * Selects the next result of a saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function searchNext(ctx, rev) {
  let { cm, ed } = ctx;
  cm.operation(function() {
    let state = getSearchState(cm);
    let cursor = getSearchCursor(cm, state.query,
                                 rev ? state.posFrom : state.posTo);

    if (!cursor.find(rev)) {
      cursor = getSearchCursor(cm, state.query, rev ?
        { line: cm.lastLine(), ch: null } : { line: cm.firstLine(), ch: 0 });
      if (!cursor.find(rev)) {
        return;
      }
    }

    ed.alignLine(cursor.from().line, "center");
    cm.setSelection(cursor.from(), cursor.to());
    state.posFrom = cursor.from();
    state.posTo = cursor.to();
  });
}

/**
 * Remove overlay.
 *
 * @memberof utils/source-search
 * @static
 */
function removeOverlay(ctx) {
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
function find(ctx, query, keepSelection) {
  clearSearch(ctx.cm);
  doSearch(ctx, false, query, keepSelection);
}

/**
 * Finds the next item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findNext(ctx, query) {
  doSearch(ctx, false, query);
}

/**
 * Finds the previous item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findPrev(ctx, query) {
  doSearch(ctx, true, query);
}

module.exports = { find, findNext, findPrev, removeOverlay };
