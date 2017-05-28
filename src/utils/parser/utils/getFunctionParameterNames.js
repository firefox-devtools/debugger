// @flow
import type { NodePath } from "babel-traverse";

export default function getFunctionParameterNames(path: NodePath): string[] {
  return path.node.params.map(param => param.name);
}
