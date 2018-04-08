/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// eslint-disable-next-line max-len
import { FindModelBoundToEditorModel } from "monaco-editor/esm/vs/editor/contrib/find/findModel";
// eslint-disable-next-line max-len
import { FindReplaceState } from "monaco-editor/esm/vs/editor/contrib/find/findState";

const LIMIT_RESULT_COUNT = 1 << 30;
const WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}|;:'\",.<>/?";

/**
 * @memberof utils/source-search
 * @static
 */
function SearchState(monaco) {
  this.findState = new FindReplaceState();
  this.findModel = new FindModelBoundToEditorModel(monaco, this.findState);
  this.dispose = () => {
    this.findState.dispose();
    this.findModel.dispose();
  };
}

/**
 * @memberof utils/source-search
 * @static
 */
function getSearchState(editor: SourceEditor) {
  const state =
    editor.searchState || (editor.searchState = new SearchState(editor.editor));
  return state;
}

export function findMatches(ctx) {
  const { monaco, ed } = ctx;
  if (!monaco || !ed) {
    return;
  }

  const { findState } = getSearchState(ed);

  const searchRange = monaco.getModel().getFullModelRange();

  return monaco
    .getModel()
    .findMatches(
      findState.searchString,
      searchRange,
      findState.isRegex,
      findState.matchCase,
      findState.wholeWord ? WORD_SEPARATORS : null,
      false,
      LIMIT_RESULT_COUNT
    )
    .map(match => ({
      line: match.range.startLineNumber - 1,
      ch: match.range.startColumn - 1
    }));
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
  const { monaco, ed } = ctx;
  if (!monaco || !ed) {
    return;
  }

  const { findModel, findState } = getSearchState(ed);

  findState.change(
    {
      searchString: query,
      matchCase: modifiers.caseSensitive,
      wholeWord: modifiers.wholeWord,
      isRegex: modifiers.regexMatch
      // isRevealed
    },
    false,
    false
  );

  if (rev) {
    findModel.moveToPrevMatch();
  } else {
    findModel.moveToNextMatch();
  }

  const currentMatch = findState.currentMatch;
  if (!currentMatch) {
    return null;
  }
  const line = currentMatch.startLineNumber - 1;
  const ch = currentMatch.startColumn - 1;

  return { line, ch };
}

/**
 * Starts a new search.
 *
 * @memberof utils/source-search
 * @static
 */
export function find(
  ctx: any,
  query: string,
  keepSelection: boolean,
  modifiers: SearchModifiers
) {
  return doSearch(ctx, false, query, keepSelection, modifiers);
}

/**
 * Finds the next item based on the currently saved search.
 *
 * @memberof utils/source-search
 * @static
 */
export function findNext(
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
export function findPrev(
  ctx: any,
  query: string,
  keepSelection: boolean,
  modifiers: SearchModifiers
) {
  return doSearch(ctx, true, query, keepSelection, modifiers);
}

export function closeSearch(ctx: any) {
  const { monaco, ed } = ctx;
  if (!monaco || !ed) {
    return;
  }
  if (ed.searchState) {
    ed.searchState.dispose();
    ed.searchState = null;
  }
  monaco.focus();
}
