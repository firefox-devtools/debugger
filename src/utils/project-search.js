export function searchSource(source, queryText) {
  const { text, id, url, loading } = source;
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
          text: result.input,
          id,
          url
        });
      }
      return indices;
    })
    .filter(_matches => _matches.length > 0);

  matches = [].concat(...matches);
  return matches;
}
