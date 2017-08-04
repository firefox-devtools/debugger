import { isPretty } from "../source";
import {
  nodeHasChildren,
  isExactUrlMatch,
  isDirectory,
  createNode
} from "./utils";
import { getURL, getFilenameFromPath } from "./getURL";

import type { Node } from "./types";

const IGNORED_URLS = ["debugger eval code", "XStringBundle"];

/**
 * Look at the nodes in the source tree, and determine the index of where to
 * insert a new node. The ordering is index -> folder -> file.
 * @memberof utils/sources-tree
 * @static
 */
function determineFileSortOrder(
  nodes: Array<Node>,
  pathPart: string,
  isLastPart: boolean,
  debuggeeUrl: string
) {
  const partIsDir = !isLastPart || pathPart.indexOf(".") === -1;

  const index = nodes.findIndex(node => {
    const nodeIsDir = nodeHasChildren(node);

    // The index will always be the first thing, so this pathPart will be
    // after it.
    if (node.name === "(index)") {
      return false;
    }

    // Directory or not, checking root url must be done first
    if (debuggeeUrl) {
      const rootUrlMatch = isExactUrlMatch(pathPart, debuggeeUrl);
      const nodeUrlMatch = isExactUrlMatch(node.name, debuggeeUrl);
      if (rootUrlMatch) {
        // pathPart matches root url and must go first
        return true;
      }
      if (nodeUrlMatch) {
        // Examined item matches root url and must go first
        return false;
      }
      // If neither is the case, continue to compare alphabetically
    }

    // If both the pathPart and node are the same type, then compare them
    // alphabetically.
    if (partIsDir === nodeIsDir) {
      return node.name.localeCompare(pathPart) >= 0;
    }

    // If the pathPart and node differ, then stop here if the pathPart is a
    // directory. Keep on searching if the part is a file, as it needs to be
    // placed after the directories.
    return partIsDir;
  });

  return index === -1 ? nodes.length : index;
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

  if (
    IGNORED_URLS.indexOf(url) != -1 ||
    !source.get("url") ||
    !url.group ||
    isPretty(source.toJS())
  ) {
    return;
  }

  url.path = decodeURIComponent(url.path);

  const parts = url.path.split("/").filter(p => p !== "");
  parts.unshift(url.group);

  let path = "";
  let subtree = tree;
  let ancestor = tree;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLastPart = i === parts.length - 1;
    if (nodeHasChildren(subtree)) {
      // the found subtree has an array, which means it is a folder
      const child = subtree.contents.find(c => c.name === part);
      if (child) {
        // A node with the same name already exists, simply traverse
        // into it. Keep track of the ancestor in case we need to make
        // changes later on.
        ancestor = subtree;
        subtree = child;
      } else {
        // No node with this name exists, so insert a new one in the
        // place that is alphabetically sorted.
        const node = createNode(part, `${path}/${part}`, []);

        let where = determineFileSortOrder(
          subtree.contents,
          part,
          isLastPart,
          i === 0 ? debuggeeUrl : ""
        );

        subtree.contents.splice(where, 0, node);
        // we enter the node
        subtree = node;
      }
    } else {
      // the found subtree is not an array, which means it is a file
      // however, we are seeing it for a second time, which means that there
      // is also a folder with this name
      const sourceContents = subtree.contents;
      const contentsUrl = getURL(sourceContents.get("url"));
      const name = getFilenameFromPath(contentsUrl.path);

      // create a new node for the part we are interested in
      // appending to the folder with the same name as the file
      const node = createNode(part, `${path}/${part}`, []);

      // create a directory has the same name as the file.
      const newDir = createNode(name, `${path}`, [node]);
      const newSource = createNode(name, `${path}`, source);
      //
      // append the new directory, with the file and the new directory
      ancestor.contents = [newDir, newSource];
      // we enter the node
      subtree = node;
    }

    // Keep track of the children so we can tag each node with them.
    path = `${path}/${part}`;
  }

  // Overwrite the contents of the final node to store the source
  // there.
  const isFile = !isDirectory(url);
  if (isFile) {
    subtree.contents = source;
  } else {
    const name = getFilenameFromPath(url.path);
    subtree.contents.unshift(createNode(name, source.get("url"), source));
  }
}
