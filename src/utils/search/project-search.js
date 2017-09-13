// Maybe reuse file search's functions?
import { isLoaded } from "../source";
import React from "react";

export function findSourceMatches(source, queryText) {
  const { text } = source;
  if (!isLoaded(source) || !text || queryText == "") {
    return [];
  }

  const lines = text.split("\n");
  let result = undefined;
  const query = new RegExp(queryText, "g");

  let matches = lines
    .map((_text, line) => {
      const indices = [];

      while ((result = query.exec(_text))) {
        indices.push({
          sourceId: source.id,
          line: line + 1,
          column: result.index,
          match: result[0],
          value: _text,
          text: result.input
        });
      }
      return indices;
    })
    .filter(_matches => _matches.length > 0);

  matches = [].concat(...matches);
  return matches;
}
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
