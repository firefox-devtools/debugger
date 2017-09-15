// @flow

import type { AstLocation, AstPosition } from "../types";
import type { Node } from "babel-traverse";

export function containsPosition(a: AstLocation, b: AstPosition) {
  const startsBefore =
    a.start.line < b.line ||
    (a.start.line === b.line && a.start.column <= b.column);
  const endsAfter =
    a.end.line > b.line || (a.end.line === b.line && a.end.column >= b.column);

  return startsBefore && endsAfter;
}

export function containsLocation(a: AstLocation, b: AstLocation) {
  return containsPosition(a, b.start) && containsPosition(a, b.end);
}

export function nodeContainsPosition(node: Node, position: AstPosition) {
  return containsPosition(node.loc, position);
}
