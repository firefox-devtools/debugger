// @flow
const escapeRegExp = require("lodash/escapeRegExp");

import type { SearchModifiers } from "../types";

type QueryOptions = {
  isGlobal: boolean,
  ignoreSpaces?: boolean
}

/**
 * Ignore doing outline matches for less than 3 whitespaces
 *
 * @memberof utils/source-search
 * @static
 */
function ignoreWhiteSpace(str: string): string {
  return /^\s{0,2}$/.test(str) ? "(?!\s*.*)" : str;
}

function wholeMatch(query: string, wholeWord: boolean): string {
  if (query == "" || !wholeWord) {
    return query;
  }

  return `\\b${query}\\b`;
}

function buildFlags(modifiers, isGlobal) {
  const { caseSensitive } = modifiers;

  if (caseSensitive && !isGlobal) {
    return undefined;
  }

  if (isGlobal && caseSensitive) {
    return "g";
  }

  if (isGlobal && !caseSensitive) {
    return "gi";
  }

  return "i";
}

function buildQuery(
  originalQuery: string, modifiers: SearchModifiers, {
    isGlobal = false,
    ignoreSpaces = false
  }: QueryOptions): RegExp {
  const { regexMatch, wholeWord } = modifiers;

  if (originalQuery == "") {
    return new RegExp(originalQuery);
  }

  let query = originalQuery;
  if (ignoreSpaces) {
    query = ignoreWhiteSpace(query);
  }

  if (!regexMatch) {
    query = escapeRegExp(query);
  }

  query = wholeMatch(query, wholeWord);
  const flags = buildFlags(modifiers, isGlobal);

  return new RegExp(query, flags);
}

module.exports = buildQuery;
