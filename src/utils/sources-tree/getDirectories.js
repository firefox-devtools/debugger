/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { createParentMap } from "./utils";
import { getURL } from "./getURL";
import type { TreeNode, TreeDirectory } from "./types";
import type { Source } from "../../types";

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

export function getDirectories(source: Source, sourceTree: TreeDirectory) {
  const url = getURL(source);
  const fullUrl = `${url.group}${url.path}`;
  const parentMap = createParentMap(sourceTree);

  const subtreeSource = findSource(sourceTree, fullUrl);
  if (!subtreeSource) {
    return [];
  }

  let node = subtreeSource;
  const directories = [];
  directories.push(subtreeSource);
  while (true) {
    node = parentMap.get(node);
    if (!node) {
      return directories;
    }
    directories.push(node);
  }
}
