"use strict";

const URL = require("url").parse;
const { assert } = require("ff-devtools-libs/shared/DevToolsUtils");

function nodeHasChildren(item) {
  // Do not use `Array.isArray` because it's slower and we do not need
  // to support multiple globals here.
  return item.contents instanceof Array;
}

function createNode(name, path, contents) {
  return {
    name,
    path,
    contents: contents || null
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
    // Currently we assume that we are descending into a node with
    // children. This will fail if a path has a directory named the
    // same as another file, like `foo/bar.js/file.js`.
    //
    // TODO: Be smarter about this, which we'll probably do when we
    // are smarter about folders and collapsing empty ones.
    assert(nodeHasChildren(subtree), `${subtree.name} should have children`);
    const subpaths = subtree.contents;

    // We want to sort alphabetically, so find the index where we
    // should insert this part.
    let idx = subpaths.findIndex(subpath => {
      return subpath.name.localeCompare(part) >= 0;
    });

    if (idx >= 0 && subpaths[idx].name === part) {
      // A node with the same name already exists, simply traverse
      // into it.
      subtree = subpaths[idx];
    } else {
      // No node with this name exists, so insert a new one in the
      // place that is alphabetically sorted.
      const node = createNode(part, path + "/" + part, []);
      const where = idx === -1 ? subpaths.length : idx;
      subpaths.splice(where, 0, node);
      subtree = subpaths[where];
    }

    // Keep track of the subpaths so we can tag each node with them.
    path = path + "/" + part;
  }

  // Overwrite the contents of the final node to store the source
  // there.
  if (isDir) {
    subtree.contents.unshift(createNode("(index)", source.get("url"), source));
  } else {
    subtree.contents = source;
  }
}

module.exports = {
  createNode,
  nodeHasChildren,
  createParentMap,
  addToTree
};
