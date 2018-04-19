/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { createParentMap, nodeHasChildren } from "./utils";
import { getURL } from "./getURL";
import type { Node } from "./types";

function findSource(sourceTree: Node, sourceUrl: string): Node {
  let returnTarget = null;
  function _traverse(subtree) {
    if (nodeHasChildren(subtree)) {
      for (const child of subtree.contents) {
        _traverse(child);
      }
    } else if (!returnTarget) {
      if (subtree.path.replace(/http(s)?:\//, "") == sourceUrl) {
        returnTarget = subtree;
        return;
      }
    }
  }

  sourceTree.contents.forEach(_traverse);

  if (!returnTarget) {
    return sourceTree;
  }

  return returnTarget;
}

export function getDirectories(sourceUrl: string, sourceTree: Node) {
  const url = getURL(sourceUrl);
  const fullUrl = `${url.group}${url.path}`;
  const parentMap = createParentMap(sourceTree);
  const source = findSource(sourceTree, fullUrl);
  if (!source) {
    return [];
  }

  let node = source;
  const directories = [];
  directories.push(source);
  while (true) {
    node = parentMap.get(node);
    if (!node) {
      return directories;
    }
    directories.push(node);
  }
}
