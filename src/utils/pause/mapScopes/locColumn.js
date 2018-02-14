// @flow

import type { Location } from "../../../types";

export function locColumn(loc: Location): number {
  if (typeof loc.column !== "number") {
    // This shouldn't really happen with locations from the AST, but
    // the datatype we are using allows null/undefined column.
    return 0;
  }

  return loc.column;
}
