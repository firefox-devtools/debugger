import buildQuery from "./build-query";

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
    const line = lines[i];
    while ((singleMatch = regexQuery.exec(line)) !== null) {
      matchedLocations.push({ line: i, ch: singleMatch.index });
    }
  }
  return matchedLocations;
}
