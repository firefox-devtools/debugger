import { nodeHasChildren, isExactUrlMatch } from "./utils";

/**
 * Look at the nodes in the source tree, and determine the index of where to
 * insert a new node. The ordering is index -> folder -> file.
 * @memberof utils/sources-tree
 * @static
 */
export function sortEntireTree(tree, debuggeeUrl = "") {
  if (nodeHasChildren(tree)) {
    const contents = sortTree(tree, debuggeeUrl).map(subtree =>
      sortEntireTree(subtree)
    );
    return { ...tree, contents };
  }
  return tree;
}

/**
 * Look at the nodes in the source tree, and determine the index of where to
 * insert a new node. The ordering is index -> folder -> file.
 * @memberof utils/sources-tree
 * @static
 */
export function sortTree(tree, debuggeeUrl = "") {
  return tree.contents.sort((previousNode, currentNode) => {
    const currentNodeIsDir = nodeHasChildren(currentNode);
    const previousNodeIsDir = nodeHasChildren(previousNode);
    if (currentNode.name === "(index)") {
      return 1;
    } else if (previousNode.name === "(index)") {
      return -1;
    } else if (isExactUrlMatch(currentNode.name, debuggeeUrl)) {
      return 1;
    } else if (isExactUrlMatch(previousNode.name, debuggeeUrl)) {
      return -1;
      // If neither is the case, continue to compare alphabetically
    } else if (previousNodeIsDir && !currentNodeIsDir) {
      return -1;
    } else if (!previousNodeIsDir && currentNodeIsDir) {
      return 1;
    }
    return previousNode.name.localeCompare(currentNode.name);
  });
}
