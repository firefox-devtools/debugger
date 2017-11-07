/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getOutOfScopeLocations } from "../reducers/ast";
import { getSelectedSource } from "../reducers/sources";
import { getSourceLineCount } from "../utils/source";

import { range } from "lodash";
import { flatMap } from "lodash";
import { uniq } from "lodash";
import { without } from "lodash";

function getOutOfScopeLines(outOfScopeLocations: AstLocation[]) {
  if (!outOfScopeLocations) {
    return null;
  }

  return uniq(
    flatMap(outOfScopeLocations, location =>
      range(location.start.line, location.end.line)
    )
  );
}

export default function getInScopeLines(state: OuterState) {
  const source = getSelectedSource(state);
  const outOfScopeLocations = getOutOfScopeLocations(state);

  if (!source || !source.get("text")) {
    return;
  }

  const linesOutOfScope = getOutOfScopeLines(
    outOfScopeLocations,
    source.toJS()
  );

  const sourceNumLines = getSourceLineCount(source.toJS());
  const sourceLines = range(1, sourceNumLines + 1);

  if (!linesOutOfScope) {
    return sourceLines;
  }

  return without(sourceLines, ...linesOutOfScope);
}
