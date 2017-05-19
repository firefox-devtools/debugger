import type { SourceText, Location, Frame, TokenResolution } from "../../types";
type Scope = {
  location: {
    line: number,
    column: number
  },
  parent: Scope,
  bindings: Object[]
};
