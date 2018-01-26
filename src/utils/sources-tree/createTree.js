/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
