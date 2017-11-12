/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { find, findNext, findPrev, removeOverlay } from "../utils/editor";
import { getMatches } from "../workers/search";
import type { ThunkArgs } from "./types";

import {
  getSelectedSource,
  getFileSearchModifiers,
  getFileSearchQuery,
  getFileSearchResults
} from "../selectors";

import {
  closeActiveSearch,
  clearHighlightLineRange,
  setActiveSearch
} from "./ui";
type Editor = Object;
type Match = Object;

export function doSearch(query: string, editor: Editor) {
  return ({ getState, dispatch }: ThunkArgs) => {
    const selectedSource = getSelectedSource(getState());
    if (!selectedSource || !selectedSource.get("text")) {
      return;
    }

    dispatch(setFileSearchQuery(query));
    dispatch(searchContents(query, editor));
  };
}

export function setFileSearchQuery(query: string) {
  return {
    type: "UPDATE_FILE_SEARCH_QUERY",
    query
  };
}

export function toggleFileSearchModifier(modifier: string) {
  return { type: "TOGGLE_FILE_SEARCH_MODIFIER", modifier };
}

export function updateSearchResults(
  characterIndex: number,
  line: number,
  matches: Match[]
) {
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

export function searchContents(query: string, editor: Object) {
  return async ({ getState, dispatch }: ThunkArgs) => {
    const modifiers = getFileSearchModifiers(getState());
    const selectedSource = getSelectedSource(getState());

    if (
      !query ||
      !editor ||
      !selectedSource ||
      !selectedSource.get("text") ||
      !modifiers
    ) {
      return;
    }

    const ctx = { ed: editor, cm: editor.codeMirror };
    const _modifiers = modifiers.toJS();
    const matches = await getMatches(
      query,
      selectedSource.get("text"),
      _modifiers
    );
    const { ch, line } = find(ctx, query, true, _modifiers);

    dispatch(updateSearchResults(ch, line, matches));
  };
}

export function traverseResults(rev: boolean, editor: Editor) {
  return async ({ getState, dispatch }: ThunkArgs) => {
    if (!editor) {
      return;
    }

    const ctx = { ed: editor, cm: editor.codeMirror };

    const query = getFileSearchQuery(getState());
    const modifiers = getFileSearchModifiers(getState());
    const { matches } = getFileSearchResults(getState());

    if (query === "") {
      dispatch(setActiveSearch("file"));
    }

    if (modifiers) {
      const matchedLocations = matches || [];
      const { ch, line } = rev
        ? findPrev(ctx, query, true, modifiers.toJS())
        : findNext(ctx, query, true, modifiers.toJS());

      console.log(line);
      dispatch(updateSearchResults(ch, line, matchedLocations));
    }
  };
}

export function closeFileSearch(editor: Editor) {
  return ({ getState, dispatch }: ThunkArgs) => {
    const modifiers = getFileSearchModifiers(getState());
    const query = getFileSearchQuery(getState());

    if (editor && modifiers) {
      const ctx = { ed: editor, cm: editor.codeMirror };
      removeOverlay(ctx, query, modifiers.toJS());
    }

    dispatch(setFileSearchQuery(""));
    dispatch(closeActiveSearch());
    dispatch(clearHighlightLineRange());
  };
}
