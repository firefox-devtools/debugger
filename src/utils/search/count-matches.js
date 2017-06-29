import buildQuery from "./build-query";

export default function countMatches(
  query: string,
  text: string,
  modifiers: SearchModifiers
): number {
  const regexQuery = buildQuery(query, modifiers, {
    isGlobal: true
  });
  const match = text.match(regexQuery);
  return match ? match.length : 0;
}
