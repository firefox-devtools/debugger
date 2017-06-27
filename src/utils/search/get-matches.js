import buildQuery from "./build-query";

export default function getMatches(
  query: string,
  text: string,
  modifiers: SearchModifiers
): number {
  const regexQuery = buildQuery(query, modifiers, {
    isGlobal: true
  });
  let matchedLocations = [];
  let singleMatch;
  let lines = text.split("\n");
  let lineNos = lines.length;
  for (let i = 0; i < lineNos; i++) {
    while ((singleMatch = regexQuery.exec(lines[i])) !== null) {
      matchedLocations.push({ line: i, ch: singleMatch.index });
    }
  }
  return matchedLocations;
}
