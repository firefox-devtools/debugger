// @flow

const { parse } = require("url");
const { assert } = require("./DevToolsUtils");
const { isPretty } = require("./source");
const merge = require("lodash/merge");

const IGNORED_URLS = ["debugger eval code", "XStringBundle"];

/**
 * Temporary Source type to be used only within this module
 * TODO: Replace with real Source type definition when refactoring types
 */
type TmpSource = { get: (key: string) => string, toJS: Function };

// TODO: createNode is exported so this type could be useful to other modules
type Node = { name: any, path: any, contents?: any };

function isHiddenSource(source: TmpSource): boolean {
  const url = source.get("url");
  return !url || /SOURCE/.test(url) || IGNORED_URLS.includes(url);
}

function nodeHasChildren(item: Node): boolean {
  return Array.isArray(item.contents);
}

function createNode(name: any, path: any, contents?: any): Node {
  return {
    name,
    path,
    contents: contents || null
  };
}

function createParentMap(tree: any): WeakMap<any, any> {
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

function getURL(source: TmpSource): { path: string, group: string } {
  const url = source.get("url");
  let def = { path: "", group: "" };
  if (!url) {
    return def;
  }

  const { pathname, protocol, host, path } = parse(url);

  switch (protocol) {
    case "javascript:":
      // Ignore `javascript:` URLs for now
      return def;

    case "about:":
      // An about page is a special case
      return merge(def, {
        path: "/",
        group: url
      });

    case null:
      if (pathname && pathname.startsWith("/")) {
        // If it's just a URL like "/foo/bar.js", resolve it to the file
        // protocol
        return merge(def, {
          path: path,
          group: "file://"
        });
      } else if (host === null) {
        // We don't know what group to put this under, and it's a script
        // with a weird URL. Just group them all under an anonymous group.
        return merge(def, {
          path: url,
          group: "(no domain)"
        });
      }
      break;

    case "http:":
    case "https:":
      return merge(def, {
        path: pathname,
        group: host
      });
  }

  return merge(def, {
    path: path,
    group: protocol ? protocol + "//" : ""
  });
}

function addToTree(tree: any, source: TmpSource) {
  const url = getURL(source);
  if (url.path === "") {
    return;
  }
  if (isHiddenSource(source) || isPretty(source.toJS())) {
    return;
  }
  url.path = decodeURIComponent(url.path);

  const parts = url.path.split("/").filter(p => p !== "");
  const isDir = (parts.length === 0 ||
                 parts[parts.length - 1].indexOf(".") === -1);
  parts.unshift(url.group);

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

/**
 * Take an existing source tree, and return a new one with collapsed nodes.
 */
function collapseTree(node: any, depth: number = 0) {
  // Node is a folder.
  if (nodeHasChildren(node)) {
    // Node is not a root/domain node, and only contains 1 item.
    if (depth > 1 && node.contents.length === 1) {
      const next = node.contents[0];
      // Do not collapse if the next node is a leaf node.
      if (nodeHasChildren(next)) {
        return collapseTree(
          createNode(`${node.name}/${next.name}`, next.path, next.contents),
          depth + 1);
      }
    }
    // Map the contents.
    return createNode(node.name, node.path,
                      node.contents.map(next => collapseTree(next, depth + 1)));
  }
  // Node is a leaf, not a folder, do not modify it.
  return node;
}

function createTree(sources: any) {
  const uncollapsedTree = createNode("root", "", []);
  for (let source of sources.valueSeq()) {
    addToTree(uncollapsedTree, source);
  }
  const sourceTree = collapseTree(uncollapsedTree);

  return { uncollapsedTree,
           sourceTree,
           parentMap: createParentMap(sourceTree),
           focusedItem: null };
}

module.exports = {
  createNode,
  nodeHasChildren,
  createParentMap,
  addToTree,
  collapseTree,
  createTree,
  getURL,
  isHiddenSource
};
