/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { Set } from "immutable";

import type { Props, State } from "./types";

import { addToTree } from "./addToTree";
import { collapseTree } from "./collapseTree";
import { createParentMap } from "./utils";

function compareProps(nextProps: Props, props: Props) {
  const next = Set(nextProps.sources.valueSeq());
  const prev = Set(props.sources.valueSeq());
  return next.subtract(prev);
}

export function updateTree(nextProps: Props, props: Props, state: State) {
  const newSet = compareProps(nextProps, props);
  const { uncollapsedTree, sourceTree } = state;
  const { debuggeeUrl, projectRoot } = nextProps;

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
