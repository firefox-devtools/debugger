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
 * This returns a mode object used by CoeMirror's addOverlay function
 * to parse and style tokens in the file.
 * The mode object contains a tokenizer function (token) which takes
 * a character stream as input, advances it past a token, and returns
 * a style for that token. For more details see
 * https://codemirror.net/doc/manual.html#modeapi
 *
 * @memberof utils/source-search
 * @static
 */
function searchOverlay(query) {
  // escape special characters
  query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  query = new RegExp(query === "" ? "(?!\s*.*)" : query, "g");
  return {
    token: function(stream) {
      query.lastIndex = stream.pos;
      let match = query.exec(stream.string);
      if (match && match.index == stream.pos) {
        stream.pos += match[0].length || 1;
        return "selecting";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
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
  cm.addOverlay(state.overlay, { opaque: true });
}

/**
 * If there's a saved search, selects the next results.
 * Otherwise, creates a new search and selects the first
 * result.
 *
 * @memberof utils/source-search
 * @static
 */
function doSearch(ctx, rev, query) {
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
    state.posFrom = state.posTo = { line: 0, ch: 0 };
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
function find(ctx, query) {
  clearSearch(ctx.cm);
  doSearch(ctx, false, query);
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

module.exports = { find, findNext, findPrev };
