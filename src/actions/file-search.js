// @flow

import { find, findNext, findPrev, removeOverlay } from "../utils/editor";
import { getMatches } from "../utils/search";
import type { ThunkArgs } from "./types";

import {
  getSelectedSource,
  getFileSearchModifiers,
  getFileSearchQuery,
  getFileSearchResults
} from "../selectors";
type Match = Object;
type Editor = Object;

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
    matches,
    matchIndex,
    count: matches.length,
    index: characterIndex
  };
}

export async function searchContents(query: string, editor: Object) {
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

    const ctx = { editor, cm: editor.codeMirror };

    const query = getFileSearchQuery(getState());
    const modifiers = getFileSearchModifiers(getState());
    const { searchResults: matches } = getFileSearchResults();

    if (query === "") {
      this.props.setActiveSearch("file");
    }

    if (modifiers) {
      const matchedLocations = matches || [];
      const { ch, line } = rev
        ? findPrev(ctx, query, true, modifiers.toJS())
        : findNext(ctx, query, true, modifiers.toJS());
      this.updateSearchResults(ch, line, matchedLocations);
    }
  };
}
