import { getOutOfScopeLocations, getSelectedSource } from "../selectors";

import range from "lodash/range";
import flatMap from "lodash/flatMap";
import uniq from "lodash/uniq";
import without from "lodash/without";

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

  const sourceNumLines = source.get("text").split("\n").length;
  const sourceLines = range(1, sourceNumLines + 1);

  if (!linesOutOfScope) {
    return sourceLines;
  }

  return without(sourceLines, ...linesOutOfScope);
}
