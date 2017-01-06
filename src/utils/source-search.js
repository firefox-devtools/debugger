const escapeRegExp = require("lodash/escapeRegExp");
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
function getSearchCursor(
  cm, query, pos, caseSensitive, wholeWord, regexMatch) {
  let moddedQuery = query;
  if (regexMatch && query !== "") {
    moddedQuery = new RegExp(query, caseSensitive ? "" : "i");
  } else if (query !== "" && (wholeWord || (wholeWord && regexMatch))) {
    moddedQuery = new RegExp(`\\b${query}\\b`, caseSensitive ? "" : "i");
  }

  if (query !== "" && typeof moddedQuery == "string") {
    return cm.getSearchCursor(moddedQuery, pos, !caseSensitive);
  }

  return cm.getSearchCursor(moddedQuery, pos);
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
function searchOverlay(query, regexMatch) {
  if (regexMatch && query !== "") {
    query = new RegExp(ignoreWhiteSpace(query));
  } else {
    query = new RegExp(escapeRegExp(ignoreWhiteSpace(query)));
  }
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
function startSearch(cm, state, query, regexMatch) {
  cm.removeOverlay(state.overlay);
  state.overlay = searchOverlay(query, regexMatch);
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
function doSearch(ctx, rev, query, caseSensitive, wholeWord, regexMatch) {
  let { cm } = ctx;
  let state = getSearchState(cm);

  if (state.query) {
    searchNext(ctx, rev, caseSensitive, wholeWord, regexMatch);
    return;
  }

  cm.operation(function() {
    if (state.query) {
      return;
    }
    startSearch(cm, state, query, regexMatch || wholeWord);
    state.query = query;
    searchNext(ctx, rev, caseSensitive, wholeWord, regexMatch);
  });
}

/**
 * Selects the next result of a saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function searchNext(ctx, rev, caseSensitive, wholeWord, regexMatch) {
  let { cm, ed } = ctx;
  cm.operation(function() {
    let state = getSearchState(cm);
    let cursor = getSearchCursor(cm, state.query,
      rev ? state.posFrom : state.posTo,
      caseSensitive, wholeWord, regexMatch);

    if (!cursor.find(rev)) {
      cursor = getSearchCursor(cm, state.query, rev ?
        { line: cm.lastLine(), ch: null } : { line: cm.firstLine(), ch: 0 },
        caseSensitive, wholeWord, regexMatch);
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
function find(ctx, query, caseSensitive, wholeWord, regexMatch) {
  clearSearch(ctx.cm);
  doSearch(ctx, false, query,
    caseSensitive, wholeWord, regexMatch);
}

/**
 * Finds the next item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findNext(ctx, query, caseSensitive, wholeWord, regexMatch) {
  doSearch(ctx, false, query, caseSensitive, wholeWord, regexMatch);
}

/**
 * Finds the previous item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
function findPrev(ctx, query, caseSensitive, wholeWord, regexMatch) {
  doSearch(ctx, true, query, caseSensitive, wholeWord, regexMatch);
}

module.exports = { find, findNext, findPrev, removeOverlay };
