/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { createNode, nodeHasChildren } from "./utils";
import type { Node } from "./types";

/**
 * Take an existing source tree, and return a new one with collapsed nodes.
 */
export function collapseTree(node: Node, depth: number = 0) {
  // Node is a folder.
  if (Array.isArray(node.contents)) {
    // Node is not a root/domain node, and only contains 1 item.
    if (depth > 1 && node.contents.length === 1) {
      const next = node.contents[0];
      // Do not collapse if the next node is a leaf node.
      if (nodeHasChildren(next)) {
        return collapseTree(
          createNode(`${node.name}/${next.name}`, next.path, next.contents),
          depth + 1
        );
      }
    }
    // Map the contents.
    return createNode(
      node.name,
      node.path,
      node.contents.map(next => collapseTree(next, depth + 1))
    );
  }
  // Node is a leaf, not a folder, do not modify it.
  return node;
}
