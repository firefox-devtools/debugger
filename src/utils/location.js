import type { Location, SourceId } from "debugger-html";

type IncompleteLocation = {
  sourceId: SourceId,
  line: ?number,
  column: ?number,
  sourceUrl?: string
};

export function createLocation({
  sourceId,
  line,
  column,
  sourceUrl
}: IncompleteLocation): Location {
  return {
    sourceId,
    line,
    column,
    sourceUrl: sourceUrl || null
  };
}
