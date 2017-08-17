import {
  nodeHasChildren,
  isDirectory,
  isInvalidUrl,
  partIsFile,
  createNode
} from "./utils";
import { getURL, getFilenameFromPath } from "./getURL";

import type { Node } from "./types";

function handleExistingChild(child, addedPartIsFile, handleConflict) {
  // A node with the same name already exists, if the part to be added is a file
  // or the existing child is a file, handle a naming conflict.
  const childIsFile = !nodeHasChildren(child);
  const hasNamingConflict =
    (childIsFile && !addedPartIsFile) || (!childIsFile && addedPartIsFile);
  if (hasNamingConflict) {
    return handleConflict();
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

function traverseTree(url, parts, tree) {
  // walk the source tree to the final node for a given url,
  // adding new nodes along the way
  let path = "";
  let subtree = tree;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const child = subtree.contents.find(c => c.name === part);
    if (child) {
      // we found a path with the same name as the part. We need to determine
      // if this is the correct child, or if we have a naming conflict
      subtree = handleExistingChild(child, partIsFile(i, parts, url), () =>
        createNodeInTree(part, path, subtree)
      );
    } else {
      // we create and enter the new node
      subtree = createNodeInTree(part, path, subtree);
    }
    // Keep track of the children so we can tag each node with them.
    path = `${path}/${part}`;
  }

  // return the last node
  return subtree;
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
  finalNode.contents = getNodeContents(finalNode, url, source);
}
