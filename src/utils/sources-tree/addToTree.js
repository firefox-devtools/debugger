// @flow

import {
  nodeHasChildren,
  isDirectory,
  isInvalidUrl,
  partIsFile,
  createNode
} from "./utils";
import { getURL, getFilenameFromPath } from "./getURL";

import type { Node } from "./types";
import type { SourceRecord } from "../../reducers/types";

function createNodeInTree(part: string, path: string, tree: Node) {
  const node = createNode(part, path, []);
  // we are modifying the tree
  tree.contents = [...tree.contents, node];
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
  url: Object
) {
  const child = subTree.contents.find(c => c.name === part);

  // we create and enter the new node
  if (!child) {
    return createNodeInTree(part, path, subTree);
  }

  // we found a path with the same name as the part. We need to determine
  // if this is the correct child, or if we have a naming conflict
  const addedPartIsFile = partIsFile(index, parts, url);
  const childIsFile = !nodeHasChildren(child);

  // if we have a naming conflict, we'll create a new node
  if ((childIsFile && !addedPartIsFile) || (!childIsFile && addedPartIsFile)) {
    return createNodeInTree(part, path, subTree);
  }

  // if there is no naming conflict, we can traverse into the child
  return child;
}

/*
 * walk the source tree to the final node for a given url,
 * adding new nodes along the way
 */
function traverseTree(url: Object, tree: Node) {
  url.path = decodeURIComponent(url.path);

  const parts = url.path.split("/").filter(p => p !== "");
  parts.unshift(url.group);

  let path = "";
  return parts.reduce((subTree, part, index) => {
    path = `${path}/${part}`;
    return findOrCreateNode(parts, subTree, path, part, index, url);
  }, tree);
}

/*
 * Add a source file to a directory node in the tree
 */
function addSourceToNode(node: Node, url: Object, source: SourceRecord) {
  const isFile = !isDirectory(url);

  // if we have a file, and the subtree has no elements, overwrite the
  // subtree contents with the source
  if (isFile) {
    return source;
  }

  const name = getFilenameFromPath(url.path);
  const existingNode = node.contents.find(childNode => childNode.name === name);

  // if we are readding an existing file in the node, overwrite the existing
  // file and return the node's contents
  if (existingNode) {
    existingNode.contents = source;
    return node.contents;
  }

  // if this is a new file, add the new file;
  const newNode = createNode(name, source.get("url"), source);
  return [...node.contents, newNode];
}

/**
 * @memberof utils/sources-tree
 * @static
 */
export function addToTree(
  tree: Node,
  source: SourceRecord,
  debuggeeUrl: string
) {
  const url = getURL(source.get("url"), debuggeeUrl);

  if (isInvalidUrl(url, source)) {
    return;
  }

  const finalNode = traverseTree(url, tree);
  finalNode.contents = addSourceToNode(finalNode, url, source);
}
