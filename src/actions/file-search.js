/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  find,
  findNext,
  findPrev,
  findMatches,
  closeSearch,
  searchSourceForHighlight
} from "../utils/monaco";

// import { isWasm, renderWasmText } from "../utils/wasm";
// import { getMatches } from "../workers/search";

import type { Action, FileTextSearchModifier, ThunkArgs } from "./types";

import {
  getSelectedSource,
  getFileSearchModifiers,
  getFileSearchQuery
} from "../selectors";

import {
  closeActiveSearch,
  clearHighlightLineRange,
  setActiveSearch
} from "./ui";
type Editor = Object;
type Match = Object;

export function doSearch(query: string, editor: Editor, rev: boolean = false) {
  return ({ getState, dispatch }: ThunkArgs) => {
    const selectedSource = getSelectedSource(getState());
    if (!selectedSource || !selectedSource.text) {
      return;
    }

    dispatch(setFileSearchQuery(query));
    dispatch(searchContents(query, editor, rev));
  };
}

export function doSearchForHighlight(
  query: string,
  editor: Editor,
  line: number,
  ch: number
) {
  return async ({ getState, dispatch }: ThunkArgs) => {
    const selectedSource = getSelectedSource(getState());
    if (!selectedSource || !selectedSource.text) {
      return;
    }
    dispatch(searchContentsForHighlight(query, editor, line, ch));
  };
}

export function setFileSearchQuery(query: string): Action {
  return {
    type: "UPDATE_FILE_SEARCH_QUERY",
    query
  };
}

export function toggleFileSearchModifier(
  modifier: FileTextSearchModifier
): Action {
  return { type: "TOGGLE_FILE_SEARCH_MODIFIER", modifier };
}

export function updateSearchResults(
  characterIndex: number,
  line: number,
  matches: Match[]
): Action {
  const matchIndex = matches.findIndex(
    elm => elm.line === line && elm.ch === characterIndex
  );

  return {
    type: "UPDATE_SEARCH_RESULTS",
    results: {
      matches,
      matchIndex,
      count: matches.length,
      index: characterIndex
    }
  };
}

export function searchContents(
  query: string,
  editor: Object,
  rev: boolean = false
) {
  return async ({ getState, dispatch }: ThunkArgs) => {
    const modifiers = getFileSearchModifiers(getState());
    const selectedSource = getSelectedSource(getState());

    if (!editor || !selectedSource || !selectedSource.text || !modifiers) {
      return;
    }

    const _modifiers = modifiers.toJS();
    const { editor: monaco } = editor;
    const ctx = {
      ed: editor,
      monaco
    };

    const res = find(ctx, query, true, _modifiers, rev);
    if (!res) {
      return;
    }

    const matches = findMatches(ctx);

    // const matches = await getMatches(
    //   query,
    //   selectedSource.get("text"),
    //   _modifiers
    // );

    const { ch, line } = res;

    dispatch(updateSearchResults(ch, line, matches));
  };
}

export function searchContentsForHighlight(
  query: string,
  editor: Object,
  line: number,
  ch: number
) {
  return async ({ getState, dispatch }: ThunkArgs) => {
    const modifiers = getFileSearchModifiers(getState());
    const selectedSource = getSelectedSource(getState());

    if (
      !query ||
      !editor ||
      !selectedSource ||
      !selectedSource.text ||
      !modifiers
    ) {
      return;
    }

    const _modifiers = modifiers.toJS();
    const { editor: monaco } = editor;
    const ctx = {
      ed: editor,
      monaco
    };

    searchSourceForHighlight(ctx, false, query, true, _modifiers, line, ch);
  };
}

export function traverseResults(rev: boolean, editor: Editor) {
  return async ({ getState, dispatch }: ThunkArgs) => {
    if (!editor) {
      return;
    }

    const { editor: monaco } = editor;
    const ctx = {
      ed: editor,
      monaco
    };

    const query = getFileSearchQuery(getState());
    const modifiers = getFileSearchModifiers(getState());

    // const { matches } = getFileSearchResults(getState());
    const matches = findMatches(ctx);

    if (query === "") {
      dispatch(setActiveSearch("file"));
    }

    if (modifiers) {
      const matchedLocations = matches || [];
      const results = rev
        ? findPrev(ctx, query, true, modifiers.toJS())
        : findNext(ctx, query, true, modifiers.toJS());

      if (!results) {
        return;
      }
      const { ch, line } = results;
      dispatch(updateSearchResults(ch, line, matchedLocations));
    }
  };
}

export function closeFileSearch(editor: Editor) {
  return ({ getState, dispatch }: ThunkArgs) => {
    const modifiers = getFileSearchModifiers(getState());
    const query = getFileSearchQuery(getState());

    if (editor && modifiers) {
      const ctx = { ed: editor, monaco: editor.editor };
      closeSearch(ctx, query, modifiers.toJS());
    }

    dispatch(setFileSearchQuery(""));
    dispatch(closeActiveSearch());
    dispatch(clearHighlightLineRange());
  };
}
