/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  nodeHasChildren,
  isDirectory,
  isInvalidUrl,
  partIsFile,
  createNode
} from "./utils";
import {
  createTreeNodeMatcher,
  findNodeInContents,
  getDomain
} from "./treeOrder";
import { getURL } from "./getURL";

import type { ParsedURL } from "./getURL";
import type { Node } from "./types";
import type { SourceRecord } from "../../types";

function isUnderRoot(url, projectRoot) {
  if (!projectRoot) {
    return true;
  }

  return `${url.group}${url.path}`.startsWith(projectRoot);
}

function removeProjectRoot(parts, projectRoot) {
  const rootParts = projectRoot.replace("://", "").split("/");
  return parts.splice(0, rootParts.length - 2);
}

function createNodeInTree(
  part: string,
  path: string,
  tree: Node,
  index: number
) {
  const node = createNode(part, path, []);

  // we are modifying the tree
  const contents = tree.contents.slice(0);
  contents.splice(index, 0, node);
  tree.contents = contents;

  return node;
}

/*
 * Look for the child directory
 * 1. if it exists return it
 * 2. if it does not exist create it
 * 3. if it is a file, replace it with a directory
 */
function findOrCreateNode(
  parts: string[],
  subTree: Node,
  path: string,
  part: string,
  index: number,
  url: Object,
  debuggeeHost: ?string
) {
  const addedPartIsFile = partIsFile(index, parts, url);
  const { found: childFound, index: childIndex } = findNodeInContents(
    subTree,
    createTreeNodeMatcher(part, !addedPartIsFile, debuggeeHost)
  );

  // we create and enter the new node
  if (!childFound) {
    return createNodeInTree(part, path, subTree, childIndex);
  }

  // we found a path with the same name as the part. We need to determine
  // if this is the correct child, or if we have a naming conflict
  const child = subTree.contents[childIndex];
  const childIsFile = !nodeHasChildren(child);

  // if we have a naming conflict, we'll create a new node
  if ((childIsFile && !addedPartIsFile) || (!childIsFile && addedPartIsFile)) {
    return createNodeInTree(part, path, subTree, childIndex);
  }

  // if there is no naming conflict, we can traverse into the child
  return child;
}

/*
 * walk the source tree to the final node for a given url,
 * adding new nodes along the way
 */
function traverseTree(
  url: Object,
  tree: Node,
  debuggeeHost: ?string,
  projectRoot: string
) {
  url.path = decodeURIComponent(url.path);

  const parts = url.path.split("/").filter(p => p !== "");
  parts.unshift(url.group);

  if (projectRoot) {
    removeProjectRoot(parts, projectRoot);
  }

  let path = "";
  return parts.reduce((subTree, part, index) => {
    path = path ? `${path}/${part}` : part;
    const debuggeeHostIfRoot = index === 0 ? debuggeeHost : null;
    return findOrCreateNode(
      parts,
      subTree,
      path,
      part,
      index,
      url,
      debuggeeHostIfRoot
    );
  }, tree);
}

/*
 * Add a source file to a directory node in the tree
 */
function addSourceToNode(node: Node, url: ParsedURL, source: SourceRecord) {
  const isFile = !isDirectory(url);

  // if we have a file, and the subtree has no elements, overwrite the
  // subtree contents with the source
  if (isFile) {
    return source;
  }

  const { filename } = url;
  const { found: childFound, index: childIndex } = findNodeInContents(
    node,
    createTreeNodeMatcher(filename, false, null)
  );

  // if we are readding an existing file in the node, overwrite the existing
  // file and return the node's contents
  if (childFound) {
    const existingNode = node.contents[childIndex];
    existingNode.contents = source;
    return node.contents;
  }

  // if this is a new file, add the new file;
  const newNode = createNode(filename, source.get("url"), source);
  const contents = node.contents.slice(0);
  contents.splice(childIndex, 0, newNode);
  return contents;
}

/**
 * @memberof utils/sources-tree
 * @static
 */
export function addToTree(
  tree: Node,
  source: SourceRecord,
  debuggeeUrl: string,
  projectRoot: string
) {
  const url = getURL(source.get("url"), debuggeeUrl);
  const debuggeeHost = getDomain(debuggeeUrl);

  if (isInvalidUrl(url, source) || !isUnderRoot(url, projectRoot)) {
    return;
  }

  const finalNode = traverseTree(url, tree, debuggeeHost, projectRoot);
  finalNode.contents = addSourceToNode(finalNode, url, source);
}
