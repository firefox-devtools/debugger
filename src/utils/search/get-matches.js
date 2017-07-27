import buildQuery from "./build-query";

function guardLineLength(line) {
  const MAX_LENGTH = 100000;
  return line.slice(0, MAX_LENGTH);
}

export default function getMatches(
  query: string,
  text: string,
  modifiers: SearchModifiers
): number {
  if (!query || !text || !modifiers) {
    return [];
  }
  const regexQuery = buildQuery(query, modifiers, {
    isGlobal: true
  });
  const matchedLocations = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let singleMatch;
    const line = guardLineLength(lines[i]);
    while ((singleMatch = regexQuery.exec(line)) !== null) {
      matchedLocations.push({ line: i, ch: singleMatch.index });
    }
  }
  return matchedLocations;
}
