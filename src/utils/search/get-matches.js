import buildQuery from "./build-query";

export default function getMatches(
  query: string,
  text: string,
  modifiers: SearchModifiers
): number {
  const regexQuery = buildQuery(query, modifiers, {
    isGlobal: true
  });
  const matchedLocations = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let singleMatch;
    while ((singleMatch = regexQuery.exec(lines[i])) !== null) {
      matchedLocations.push({ line: i, ch: singleMatch.index });
    }
  }
  return matchedLocations;
}
