/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { addToTree } from "./addToTree";
import { collapseTree } from "./collapseTree";
import { createParentMap, isDirectory } from "./utils";
import { difference } from "lodash";
import {
  getDomain,
  findNodeInContents,
  createTreeNodeMatcher
} from "./treeOrder";
import type { SourcesMap } from "../../reducers/types";
import type { TreeDirectory, TreeNode } from "./types";

function newSourcesSet(newSources, prevSources) {
  const newSourceIds = difference(
    Object.keys(newSources),
    Object.keys(prevSources)
  );
  const uniqSources = newSourceIds.map(id => newSources[id]);
  return uniqSources;
}

function findFocusedItemInTree(
  newSourceTree: TreeDirectory,
  debuggeeHost: ?string,
  focusedItem: ?TreeNode
): ?TreeNode {
  if (focusedItem) {
    const parts = focusedItem.path.split("/").filter(p => p !== "");
    let path = "";

    console.log("------ START OF TREE SEARCH ------");
    focusedItem = parts.reduce((subTree, part, index) => {
      console.log("SUB TREE:", subTree);
      console.log("PART:", part);
      console.log("PARTS:", parts);
      console.log("IS DIRECTORY:", isPartDir(focusedItem, parts.length, index));
      path = path ? `${path}/${part}` : part;
      const { index: childIndex } = findNodeInContents(
        subTree,
        createTreeNodeMatcher(
          part,
          isPartDir(focusedItem, parts.length, index),
          debuggeeHost
        )
      );
      console.log("------ END OF LOOP ------");
      return subTree.contents[childIndex];
    }, newSourceTree);
    console.log("------ END OF TREE SEARCH ------");
    console.log("FOCUSED ITEM:", focusedItem);
  }

  return focusedItem;
}

function isPartDir(focusedItem: ?TreeNode, partsLength, index) {
  if (focusedItem && isDirectory(focusedItem)) {
    return true;
  }
  return partsLength - 1 != index;
}

type Params = {
  newSources: SourcesMap,
  prevSources: SourcesMap,
  uncollapsedTree: TreeDirectory,
  sourceTree: TreeDirectory,
  debuggeeUrl: string,
  projectRoot: string,
  focusedItem: ?TreeNode
};

export function updateTree({
  newSources,
  prevSources,
  debuggeeUrl,
  projectRoot,
  uncollapsedTree,
  sourceTree,
  focusedItem
}: Params) {
  const newSet = newSourcesSet(newSources, prevSources);
  const debuggeeHost = getDomain(debuggeeUrl);

  for (const source of newSet) {
    addToTree(uncollapsedTree, source, debuggeeHost, projectRoot);
  }

  const newSourceTree = collapseTree(uncollapsedTree);

  return {
    uncollapsedTree,
    sourceTree: newSourceTree,
    parentMap: createParentMap(newSourceTree),
    focusedItem: findFocusedItemInTree(newSourceTree, debuggeeHost, focusedItem)
  };
}
