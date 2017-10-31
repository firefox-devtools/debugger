import type { Source } from "debugger-html";
import { AstPosition } from "./types";
import { getClosestPath } from "./utils/closest";
import { isAwaitExpression, isYieldExpression } from "./utils/helpers";
import type { NodePath } from "babel-traverse";

export function getNextStep(source: Source, pausedPosition: AstPosition) {
  const currentExpression = getSteppableExpression(source, pausedPosition);
  if (!currentExpression) {
    return null;
  }
  const currentStatement = currentExpression.getStatementParent();
  return _getNextStep(currentStatement, pausedPosition);
}

function getSteppableExpression(source: Source, pausedPosition: AstPosition) {
  const closestPath = getClosestPath(source, pausedPosition);

  if (!closestPath) {
    return null;
  }

  if (isAwaitExpression(closestPath) || isYieldExpression(closestPath)) {
    return closestPath;
  }

  return closestPath.find(p => p.isAwaitExpression() || p.isYieldExpression());
}

function _getNextStep(statement: NodePath, position: AstPosition) {
  const nextStatement = statement.getSibling(statement.key + 1);
  if (nextStatement.node) {
    return {
      ...nextStatement.node.loc.start,
      sourceId: position.sourceId
    };
  }

  return null;
}
