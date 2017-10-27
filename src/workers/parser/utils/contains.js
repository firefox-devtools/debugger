// @flow

import type { AstLocation, AstPosition } from "../types";
import type { Node } from "babel-traverse";

function startsBefore(a: AstLocation, b: AstPosition) {
  let before = a.start.line < b.line;
  if (a.start.line === b.line) {
    before =
      a.start.column >= 0 && b.column >= 0 ? a.start.column <= b.column : true;
  }
  return before;
}

function endsAfter(a: AstLocation, b: AstPosition) {
  let after = a.end.line > b.line;
  if (a.end.line === b.line) {
    after =
      a.end.column >= 0 && b.column >= 0 ? a.end.column >= b.column : true;
  }
  return after;
}

export function containsPosition(a: AstLocation, b: AstPosition) {
  return startsBefore(a, b) && endsAfter(a, b);
}

export function containsLocation(a: AstLocation, b: AstLocation) {
  return containsPosition(a, b.start) && containsPosition(a, b.end);
}

export function nodeContainsPosition(node: Node, position: AstPosition) {
  return containsPosition(node.loc, position);
}
