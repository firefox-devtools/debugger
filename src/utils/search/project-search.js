// Maybe reuse file search's functions?
export function searchSource(source, queryText) {
  const { text, loading } = source;
  if (loading || !text || queryText == "") {
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

export default function searchSources(query, sources) {
  return sources.map(source => ({
    source,
    filepath: source.url,
    matches: searchSource(source, query)
  }));
}
