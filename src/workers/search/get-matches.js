/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import buildQuery from "../../utils/build-query";

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
