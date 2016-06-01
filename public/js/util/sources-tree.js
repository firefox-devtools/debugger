"use strict";

const URL = require("url").parse;
const { assert } = require("ff-devtools-libs/shared/DevToolsUtils");

function nodeHasChildren(item) {
  // Do not use `Array.isArray` because it's slower and we do not need
  // to support multiple globals here.
  return item.contents instanceof Array;
}

function createNode(name, path, contents, baseName = name) {
  return {
    name,
    path,
    contents: contents || null,
    // If a node is collaped, the base folder name, e.g. a node with the name
    // "a/b/c" would have the baseName "a"
    baseName
  };
}

function createParentMap(tree) {
  const map = new WeakMap();

  function _traverse(subtree) {
    if (nodeHasChildren(subtree)) {
      for (let child of subtree.contents) {
        map.set(child, subtree);
        _traverse(child);
      }
    }
  }

  // Don't link each top-level path to the "root" node because the
  // user never sees the root
  tree.contents.forEach(_traverse);
  return map;
}

function getURL(source) {
  if (!source.get("url")) {
    return null;
  }

  let url;
  try {
    url = new URL(source.get("url"));
  } catch (e) {
    // If there is a parse error (which may happen with various
    // internal script that don't have a correct URL), just ignore it.
    return null;
  }

  // Filter out things like `javascript:<code>` URLs for now.
  // Whitelist the protocols because there may be several strange
  // ones.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  return url;
}

/**
 * Takes two parts array, and returns the common path.
 */
function getSharedParts(partsA, partsB) {
  const sharedParts = [];
  for (let j = 0; j < partsA.length; j++) {
    const partA = partsA[j];
    const partB = partsB[j];
    if (partA === partB) {
      sharedParts.push(partA);
    } else {
      break;
    }
  }
  return sharedParts;
}

function isCollapsed(node) {
  return node.baseName !== node.name;
}

function addToTree(currentNode, source) {
  const url = getURL(source);
  if (!url) {
    return;
  }

  const parts = url.pathname.split("/").filter(p => p !== "");
  const isDir = partsIsDir(parts);
  parts.unshift(url.host);
  if (url.hash) {
    // Add on the URL hash if there is one. Some sites load in duplicate sources
    // with different contents.
    //
    // TODO - Figure out a more elegant way of handling duplicate sources.
    parts[parts.length - 1] += url.hash;
  }

  let accumulatedPath = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const contents = currentNode.contents;

    // Currently we assume that we are descending into a node with
    // children. This will fail if a path has a directory named the
    // same as another file, like `foo/bar.js/file.js`.
    //
    // TODO: Be smarter about this.
    assert(nodeHasChildren(currentNode),
           `${currentNode.name} should have children`);

    // We want to sort alphabetically, so find the index where we
    // should insert this part.
    let index = getSortedIndex(contents, part);

    if (index >= 0 && contents[index].baseName === part) {
      // A node with the same name already exists
      if (isCollapsed(contents[index])) {
        // This node is collapsed, merge in shared nodes.
        currentNode = mergeIntoCollapsedNode(contents[index], accumulatedPath,
                                             parts, i);
        break;
      } else {
        // Continue traversing into the tree.
        currentNode = contents[index];
      }
    } else {
      // Insert a new node, optionally collapsed, in the correct
      // alphabetically sorted location, since a node with that name did not
      // exist.
      currentNode = insertNodeIntoContents(contents, accumulatedPath, parts, i,
                                           index);
      if (isCollapsed(currentNode)) {
        // Jump to the end of this loop to insert a final leaf node.
        i = parts.length - 2;
      }
    }
    // Keep track of the accumulated path so we can tag each node with them.
    accumulatedPath = accumulatedPath + "/" + currentNode.name;
  }

  // Overwrite the contents of the final node to store the source there.
  if (isDir) {
    currentNode.contents = [createNode("(index)", source.get("url"), source)];
  } else {
    currentNode.contents = source;
  }
}

function partsIsDir(parts) {
  return (parts.length === 0 || parts[parts.length - 1].indexOf(".") === -1);
}

function insertNodeIntoContents(contents, path, parts, partsIndex,
                                contentsIndex) {
  const isDomain = partsIndex === 0;
  const remainingParts = parts.length - partsIndex;
  const nodeIsCollapsed = !isDomain && remainingParts > 2;
  let part = parts[partsIndex];
  const baseName = part;
  if (nodeIsCollapsed) {
    // Collapse the remaining directory path
    part = parts.slice(partsIndex, parts.length - 1).join("/");
  }

  const node = createNode(part, path + "/" + part, [], baseName);
  const where = contentsIndex === -1 ? contents.length : contentsIndex;
  contents.splice(where, 0, node);
  return node;
}

function mergeIntoCollapsedNode(target, path, parts, partsIndex) {
  // A is the target, B is the new source node.
  const partsA = target.name.split("/");
  const partsB = parts.slice(partsIndex, parts.length);
  const sharedParts = getSharedParts(partsA, partsB);
  const sharedName = sharedParts.join("/");
  const sharedPath = path + "/" + sharedName;
  const nextPartsA = partsA.slice(sharedParts.length, partsA.length);
  const nextPartsB = partsB.slice(sharedParts.length, partsB.length);

  // Update the target being attached to.
  target.name = sharedName;
  target.path = path + "/" + sharedName;
  target.baseName = sharedParts[0];

  if (nextPartsA.length > 0) {
    /**
     * Create a new intermediate node for the contents of A.
     *
     *   "a/b/c/d/file.js" + "a/b/file.js"
     *   Create "c/d" and attach it to the "a/b" target node.
     */
    let node = createNode(nextPartsA.join("/"), sharedPath, target.contents,
                          nextPartsA[0]);
    target.contents = [node];
  }

  const nameNodeB = partsIsDir(nextPartsB) ? "(index)" : nextPartsB.pop();
  let parentB = target;
  if (nextPartsB.length > 0) {
    /**
     * Create the parent node for node B
     *
     *   "a/b/file.js" + "a/b/c/d/file.js"
     *   Create "c/d" and attach it to the "a/b" target node.
     */
    const parentNameB = nextPartsB.join("/");
    parentB = createNode(parentNameB, sharedPath + "/" + parentNameB, [],
                         nextPartsB[0]);
    insertNodeIntoSortedList(target.contents, parentB);
  }

  // Create node B, and return it.
  let nodeB = createNode(nameNodeB, parentB.path + "/" + nameNodeB);
  insertNodeIntoSortedList(parentB.contents, nodeB);
  return nodeB;
}

function getSortedIndex(contents, part) {
  return contents.findIndex(nodeB => {
    return nodeB.baseName.localeCompare(part) >= 0;
  });
}

function insertNodeIntoSortedList(contents, node) {
  let index = getSortedIndex(contents, node.baseName);
  if (index >= 0) {
    contents.splice(index, 0, node);
  } else {
    contents.push(node);
  }
}

module.exports = {
  createNode,
  nodeHasChildren,
  createParentMap,
  addToTree
};
