// @flow

import { createNode, createParentMap } from "./utils";
import { collapseTree } from "./collapseTree";
import { sortEntireTree } from "./sortTree";
import { addToTree } from "./addToTree";

import type { SourcesMap } from "../../reducers/types";

export function createTree(sources: SourcesMap, debuggeeUrl: string) {
  const uncollapsedTree = createNode("root", "", []);
  for (const source of sources.valueSeq()) {
    addToTree(uncollapsedTree, source, debuggeeUrl);
  }

  const sourceTree = sortEntireTree(collapseTree(uncollapsedTree), debuggeeUrl);

  return {
    uncollapsedTree,
    sourceTree,
    parentMap: createParentMap(sourceTree),
    focusedItem: null
  };
}
