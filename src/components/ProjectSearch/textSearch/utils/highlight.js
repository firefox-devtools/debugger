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
