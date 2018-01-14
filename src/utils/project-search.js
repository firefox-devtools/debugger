/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// Maybe reuse file search's functions?
import React from "react";

export function highlightMatches(lineMatch) {
  const { value, column, match } = lineMatch;
  const len = match.length;

  return (
    <span className="line-value">
      <span className="line-match" key={0}>
        {value.slice(0, column)}
      </span>
      <span className="query-match" key={1}>
        {value.substr(column, len)}
      </span>
      <span className="line-match" key={2}>
        {value.slice(column + len, value.length)}
      </span>
    </span>
  );
}
