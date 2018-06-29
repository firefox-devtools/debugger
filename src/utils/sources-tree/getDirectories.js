/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { createParentMap } from "./utils";
import { getURL } from "./getURL";
import type { TreeNode, TreeDirectory } from "./types";

function findSource(sourceTree: TreeDirectory, sourceUrl: string): TreeNode {
  let returnTarget = null;
  function _traverse(subtree: TreeNode) {
    if (subtree.type === "directory") {
      for (const child of subtree.contents) {
        _traverse(child);
      }
    } else if (!returnTarget) {
      if (subtree.path.replace(/http(s)?:\/\//, "") == sourceUrl) {
        returnTarget = subtree;
        return;
      }
    }
  }

  sourceTree.contents.forEach(node => _traverse(node));

  if (!returnTarget) {
    return sourceTree;
  }

  return returnTarget;
}

export function getDirectories(sourceUrl: string, sourceTree: TreeDirectory) {
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
