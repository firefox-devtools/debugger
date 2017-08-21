import { Source } from "../../../flow-typed/debugger-html";
import { AstPosition } from "./types";
import { getClosestPath } from "./utils/closest";
import { isAwaitExpression, containsPosition } from "./utils/helpers";
import type { NodePath } from "babel-traverse";

export function getNextStep(
  source: Source,
  stepType: string,
  pausedPosition: AstPosition
) {
  const closestPath = getClosestPath(source, pausedPosition);
  if (!closestPath) {
    return { nextStepType: stepType };
  }
  if (isAwaitExpression(closestPath, pausedPosition)) {
    const nextHiddenBreakpointLocation = getLocationAfterAwaitExpression(
      closestPath,
      pausedPosition
    );
    return { nextStepType: "resume", nextHiddenBreakpointLocation };
  }
  return { nextStepType: stepType };
}

function getLocationAfterAwaitExpression(
  path: NodePath,
  position: AstPosition
) {
  const children = getFunctionBodyChildren(path);
  if (!children) {
    return;
  }
  for (let i = 0; i !== children.length; i++) {
    const child = children[i];
    if (containsPosition(child.loc, position)) {
      const nextChild = children[++i];
      const nextLocation = nextChild.loc.start;
      nextLocation.sourceId = position.sourceId;
      return nextLocation;
    }
  }
}

function getFunctionBodyChildren(path: NodePath) {
  const blockScope = path.scope.block;
  if (!blockScope) {
    return;
  }
  const children = blockScope.body.body;
  return children;
}
