/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  type SymbolDeclaration,
  type SymbolDeclarations
} from "../../workers/parser";

import type { Source } from "../../types";

function updateSymbolLocation(
  site: SymbolDeclaration,
  source: Source,
  sourceMaps: any
) {
  site.location.start.sourceId = source.id;
  return sourceMaps
    .getGeneratedLocation(site.location.start, source)
    .then(loc => {
      // site.generatedLocation = { line: loc.line, column: loc.column };
      return {
        ...site,
        generatedLocation: { line: loc.line, column: loc.column }
      };
    });
}

export async function updateSymbolLocations(
  symbols: SymbolDeclarations,
  source: Source,
  sourceMaps: any
): Promise<SymbolDeclarations> {
  if (!symbols || !symbols.callExpressions) {
    return Promise.resolve(symbols);
  }

  const mappedCallExpressions = await Promise.all(
    symbols.callExpressions.map(site =>
      updateSymbolLocation(site, source, sourceMaps)
    )
  );

  symbols.callExpressions = mappedCallExpressions;

  console.log(mappedCallExpressions);

  Promise.resolve(symbols);
}
