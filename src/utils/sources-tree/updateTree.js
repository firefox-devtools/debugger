/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Props, State } from "./types";

import { addToTree } from "./addToTree";
import { collapseTree } from "./collapseTree";
import { createParentMap } from "./utils";

import type { SourcesMap } from "../../reducers/types";
import type { Node } from "./types";

function newSourcesSet(newSources, prevSources) {
  const next = newSources.toSet();
  const prev = prevSources.toSet();
  return next.subtract(prev);
}

type Params = {
  newSources: SourcesMap,
  prevSources: SourcesMap,
  uncollapsedTree: Node,
  sourceTree: Node,
  debuggeeUrl: string,
  projectRoot: string
};

export function updateTree({
  newSources,
  prevSources,
  debuggeeUrl,
  projectRoot,
  uncollapsedTree,
  sourceTree
}: Params) {
  const newSet = newSourcesSet(newSources, prevSources);

  for (const source of newSet) {
    addToTree(uncollapsedTree, source, debuggeeUrl, projectRoot);
  }

  const newSourceTree = collapseTree(uncollapsedTree);

  return {
    uncollapsedTree,
    sourceTree: newSourceTree,
    parentMap: createParentMap(sourceTree),
    focusedItem: null
  };
}
