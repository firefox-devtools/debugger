import {
  nodeHasChildren,
  isDirectory,
  isInvalidUrl,
  partIsFile,
  createNode
} from "./utils";
import { getURL, getFilenameFromPath } from "./getURL";

import type { Node } from "./types";

// update this part
// A node with the same name already exists, if the part to be added is a file
// or the existing child is a file, handle a naming conflict.
function handleExistingChild(part, path, subtree, child, parts, url, i) {
  const addedPartIsFile = partIsFile(i, parts, url);
  const childIsFile = !nodeHasChildren(child);
  const hasNamingConflict =
    (childIsFile && !addedPartIsFile) || (!childIsFile && addedPartIsFile);

  if (hasNamingConflict) {
    return createNodeInTree(part, path, subtree);
  }

  // if there is no naming conflict, we can traverse into the child
  return child;
}

function createNodeInTree(part, path, tree) {
  const node = createNode(part, `${path}/${part}`, []);
  // we are modifying the tree
  tree.contents = [...tree.contents, node];
  return node;
}

function updatePart(parts, subTree, path, part, index, url) {
  const child = subTree.contents.find(c => c.name === part);
  if (child) {
    // we found a path with the same name as the part. We need to determine
    // if this is the correct child, or if we have a naming conflict
    subTree = handleExistingChild(
      part,
      path,
      subTree,
      child,
      parts,
      url,
      index
    );
  } else {
    // we create and enter the new node
    subTree = createNodeInTree(part, path, subTree);
  }
}

function traverseTree(url, parts, tree) {
  // walk the source tree to the final node for a given url,
  // adding new nodes along the way
  let path = "";

  return parts.reduce((subTree, part, index) => {
    path = `${path}/${part}`;
    return updatePart(parts, subTree, path, part, index, url);
  }, []);
}

function getNodeContents(node, url, source) {
  const isFile = !isDirectory(url);
  if (isFile) {
    // if we have a file, and the subtree has no elements, overwrite the
    // subtree contents with the source
    return source;
  }
  const name = getFilenameFromPath(url.path);
  // if we are readding an existing file in the node, overwrite the existing
  // file and return the node's contents
  const existingNode = node.contents.find(childNode => childNode.name === name);
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
  const url = getURL(source.get("url"));

  if (isInvalidUrl(url, source)) {
    return;
  }

  url.path = decodeURIComponent(url.path);

  const parts = url.path.split("/").filter(p => p !== "");
  parts.unshift(url.group);

  const finalNode = traverseTree(url, parts, tree);
  // update the final node with the correct contents

  // change the name
  finalNode.contents = getNodeContents(finalNode, url, source);
}
