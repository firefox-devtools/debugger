/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// Maybe reuse file search's functions?

import getMatches from "./get-matches";

export function findSourceMatches(source, queryText) {
  const { loadedState, text } = source;
  if (loadedState != "loaded" || !text || queryText == "") {
    return [];
  }

  const modifiers = {
    caseSensitive: false,
    regexMatch: false,
    wholeWord: false
  };

  const lines = text.split("\n");

  return getMatches(queryText, text, modifiers).map(({ line, ch }) => {
    const { value, c } = truncateLine(lines[line], ch);
    return {
      line: line + 1,
      column: ch,
      tc: c,
      match: queryText,
      value
    };
  });
}

const startRegex = /([ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/g;
const endRegex = new RegExp(
  [
    "([ !@#$%^&*()_+-=[]{};':\"\\|,.<>/?])",
    '[^ !@#$%^&*()_+-=[]{};\':"\\|,.<>/?]*$"/'
  ].join("")
);

function truncateLine(text, column) {
  if (text.length < 100) {
    return {
      c: column,
      value: text
    };
  }
  const offset = Math.max(column - Math.floor(Math.random() * 10 + 30), 0);
  const truncStr = text.slice(offset, column + 400);
  let start = truncStr.search(startRegex);
  let end = truncStr.search(endRegex);
  if (start > column) {
    start = -1;
  }
  if (end === -1) {
    end = text.length;
  } else if (end < column) {
    end = truncStr.length;
  }
  const value = truncStr.slice(start + 1, end);

  return {
    c: column - start - offset - 1,
    value
  };
}
