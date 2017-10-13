// @flow

import { createNode, createParentMap } from "./utils";
import { collapseTree } from "./collapseTree";
import { addToTree } from "./addToTree";

import type { SourcesMap } from "../../reducers/types";

export function createTree(
  sources: SourcesMap,
  debuggeeUrl: string,
  projectRoot: string
) {
  const uncollapsedTree = createNode("root", "", []);
  for (const source of sources.valueSeq()) {
    addToTree(uncollapsedTree, source, debuggeeUrl, projectRoot);
  }

  const sourceTree = collapseTree(uncollapsedTree);

  return {
    uncollapsedTree,
    sourceTree,
    parentMap: createParentMap(sourceTree),
    focusedItem: null
  };
}
