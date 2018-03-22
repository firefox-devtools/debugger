/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { addToTree } from "./addToTree";
import { collapseTree } from "./collapseTree";
import { createNode, createParentMap } from "./utils";

import type { SourcesMap } from "../../reducers/types";

type Params = {
  sources: SourcesMap,
  debuggeeUrl: string,
  projectRoot: string
};

export function createTree({ sources, debuggeeUrl, projectRoot }: Params) {
  const uncollapsedTree = createNode("root", "", []);
  for (const source of sources.valueSeq()) {
    addToTree(uncollapsedTree, source, debuggeeUrl, projectRoot);
  }

  // If a project root is set but the page does not have an sources for that root,
  // continue to store the root but show the entire tree for the time being
  let projectRootUsed = true;
  if (uncollapsedTree.contents.length === 0) {
    projectRootUsed = false;
    for (const source of sources.valueSeq()) {
      addToTree(uncollapsedTree, source, debuggeeUrl, "");
    }
  }

  const sourceTree = collapseTree(uncollapsedTree);

  return {
    uncollapsedTree,
    sourceTree,
    projectRootUsed,
    parentMap: createParentMap(sourceTree),
    focusedItem: null
  };
}
