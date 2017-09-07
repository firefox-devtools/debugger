import React from "react";
import { escapeRegExp } from "lodash";
export function highlightMatches(value, inputValue) {
  let match;
  const len = inputValue.length;
  let matchIndexes = [];
  let matches = [];
  const re = new RegExp(escapeRegExp(inputValue), "g");
  while ((match = re.exec(value)) !== null) {
    matchIndexes.push(match.index);
  }

  matchIndexes.forEach((matchIndex, index) => {
    if (matchIndex > 0 && index === 0) {
      const val = value.slice(0, matchIndex);
      matches.push(
        <span className="line-match" key={val}>
          {val}
        </span>
      );
    }
    if (matchIndex > matchIndexes[index - 1] + len) {
      const val = value.slice(matchIndexes[index - 1] + len, matchIndex);
      matches.push(<span className="line-match" key={val} />);
    }
    const val2 = value.substr(matchIndex, len);
    matches.push(
      <span className="query-match" key={index} key={val2}>
        {val2}
      </span>
    );
    if (index === matchIndexes.length - 1) {
      const val3 = value.slice(matchIndex + len, value.length);
      matches.push(
        <span>
          {" "}
          className= "line-match" key={val3}
          {val3}
        </span>
      );
    }
  });

  return <span className="line-value">{matches}</span>;
}
