export function hightlightMatches(value, inputValue) {
  const { inputValue } = this.state;
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
      matches.push(
        dom.span({ className: "line-match" }, value.slice(0, matchIndex))
      );
    }
    if (matchIndex > matchIndexes[index - 1] + len) {
      matches.push(
        dom.span(
          { className: "line-match" },
          value.slice(matchIndexes[index - 1] + len, matchIndex)
        )
      );
    }
    matches.push(
      dom.span(
        { className: "query-match", key: index },
        value.substr(matchIndex, len)
      )
    );
    if (index === matchIndexes.length - 1) {
      matches.push(
        dom.span(
          {
            className: "line-match"
          },
          value.slice(matchIndex + len, value.length)
        )
      );
    }
  });

  return <span className="line-value">{matches}</span>;
}
