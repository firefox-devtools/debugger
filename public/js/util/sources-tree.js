"use strict";

const URL = require("url").parse;

function nodeHasChildren(item) {
  return item[2] instanceof Array;
}

function nodeName(item) {
  return item[0];
}

function nodePath(item) {
  return item[1];
}

function nodeContents(item) {
  return item[2];
}

function setNodeContents(item, contents) {
  item[2] = contents;
}

function createNode(name, path, contents) {
  return [name, path, contents || null];
}

function createParentMap(tree) {
  const map = new WeakMap();

  function _traverse(subtree) {
    if (nodeHasChildren(subtree)) {
      for (let child of nodeContents(subtree)) {
        map.set(child, subtree);
        _traverse(child);
      }
    }
  }

  // Don't link each top-level path to the "root" node because the
  // user never sees the root
  nodeContents(tree).forEach(_traverse);
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

function addToTree(tree, source) {
  const url = getURL(source);
  if (!url) {
    return;
  }

  const parts = url.pathname.split("/").filter(p => p !== "");
  const isDir = (parts.length === 0 ||
                 parts[parts.length - 1].indexOf(".") === -1);
  parts.unshift(url.host);

  let path = "";
  let subtree = tree;

  for (let part of parts) {
    const subpaths = nodeContents(subtree);
    // We want to sort alphabetically, so find the index where we
    // should insert this part.
    let idx = subpaths.findIndex(subpath => {
      return nodeName(subpath).localeCompare(part) >= 0;
    });

    // The node always acts like one with children, but the code below
    // this loop will set the contents of the final node to the source
    // object.
    const pathItem = createNode(part, path + "/" + part, []);

    if (idx >= 0 && nodeName(subpaths[idx]) === part) {
      subtree = subpaths[idx];
    } else {
      // Add a new one
      const where = idx === -1 ? subpaths.length : idx;
      subpaths.splice(where, 0, pathItem);
      subtree = subpaths[where];
    }

    // Keep track of the subpaths so we can tag each node with them.
    path = path + "/" + part;
  }

  // Store the soure in the final created node.
  if (isDir) {
    setNodeContents(
      subtree,
      [createNode("(index)", source.get("url"), source)]
    );
  } else {
    setNodeContents(subtree, source);
  }
}

module.exports = {
  nodeHasChildren,
  nodeName,
  nodePath,
  nodeContents,
  setNodeContents,
  createNode,
  createParentMap,
  addToTree
};
