import { Source } from "../../../flow-typed/debugger-html";
import { AstPosition } from "./types";
import { getClosestPath } from "./utils/closest";
import { isAwaitExpression } from "./utils/helpers";
import type { NodePath } from "babel-traverse";

export function getNextStep(source: Source, pausedPosition: AstPosition) {
  const awaitExpression = getAwaitExpression(source, pausedPosition);
  if (!awaitExpression) {
    return null;
  }
  const awaitStatement = awaitExpression.getStatementParent();
  return getLocationAfterAwaitExpression(awaitStatement, pausedPosition);
}

function getAwaitExpression(source: Source, pausedPosition: AstPosition) {
  const closestPath = getClosestPath(source, pausedPosition);

  if (!closestPath) {
    return null;
  }

  if (isAwaitExpression(closestPath)) {
    return closestPath;
  }

  return closestPath.find(p => p.isAwaitExpression());
}

function getLocationAfterAwaitExpression(
  statement: NodePath,
  position: AstPosition
) {
  const nextStatement = statement.getSibling(statement.key + 1);
  if (nextStatement.node) {
    return {
      ...nextStatement.node.loc.start,
      sourceId: position.sourceId
    };
  }

  return null;
}
