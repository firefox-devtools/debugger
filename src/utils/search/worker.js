import buildQuery from "./utils/build-query";
import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

export function countMatches(
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

self.onmessage = workerHandler({ countMatches });
