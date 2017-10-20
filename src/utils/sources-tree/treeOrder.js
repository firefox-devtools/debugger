// @flow

import { parse } from "url";

import { nodeHasChildren } from "./utils";

import type { Node } from "./types";

/*
 * Gets domain from url (without www prefix)
 */
export function getDomain(url?: string): ?string {
  // TODO: define how files should be ordered on the browser debugger
  if (!url) {
    return null;
  }
  const { host } = parse(url);
  if (!host) {
    return null;
  }
  return host.startsWith("www.") ? host.substr("www.".length) : host;
}

/*
 * Checks if node name matches debugger host/domain.
 */
function isExactDomainMatch(part: string, debuggeeHost: string): boolean {
  return part.startsWith("www.")
    ? part.substr("www.".length) === debuggeeHost
    : part === debuggeeHost;
}

/*
 * Function to assist with node search for a defined sorted order, see e.g.
 * `createTreeNodeMatcher`. Returns negative number if the node
 * stands earlier in sorting order, positive number if the node stands later
 * in sorting order, or zero if the node is found.
 */
export type FindNodeInContentsMatcher = (node: Node) => number;

/*
 * Performs a binary search to insert a node into contents. Returns positive
 * number, index of the found child, or negative number, which can be used
 * to calculate a position where a new node can be inserted (`-index - 1`).
 * The matcher is a function that returns result of comparision of a node with
 * lookup value.
 */
export function findNodeInContents(
  tree: Node,
  matcher: FindNodeInContentsMatcher
) {
  const { contents } = tree;
  if (contents.length === 0) {
    return { found: false, index: 0 };
  }
  let left = 0;
  let right = contents.length - 1;
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (matcher(contents[middle]) < 0) {
      left = middle + 1;
    } else {
      right = middle;
    }
  }
  const result = matcher(contents[left]);
  if (result === 0) {
    return { found: true, index: left };
  }
  return { found: false, index: result > 0 ? left : left + 1 };
}

const IndexName = "(index)";

function createTreeNodeMatcherWithIndex(): FindNodeInContentsMatcher {
  return (node: Node) => (node.name === IndexName ? 0 : 1);
}

function createTreeNodeMatcherWithDebuggeeHost(
  debuggeeHost: string
): FindNodeInContentsMatcher {
  return (node: Node) => {
    if (node.name === IndexName) {
      return -1;
    }
    return isExactDomainMatch(node.name, debuggeeHost) ? 0 : 1;
  };
}

function createTreeNodeMatcherWithNameAndOther(
  part: string,
  isDir: boolean,
  debuggeeHost: ?string
): FindNodeInContentsMatcher {
  return (node: Node) => {
    if (node.name === IndexName) {
      return -1;
    }
    if (debuggeeHost && isExactDomainMatch(node.name, debuggeeHost)) {
      return -1;
    }
    const nodeIsDir = nodeHasChildren(node);
    if (nodeIsDir && !isDir) {
      return -1;
    } else if (!nodeIsDir && isDir) {
      return 1;
    }
    return node.name.localeCompare(part);
  };
}

/*
 * Creates a matcher for findNodeInContents.
 * The sorting order of nodes during comparison is:
 * - "(index)" node
 * - root node with the debuggee host/domain
 * - hosts/directories (not files) sorted by name
 * - files sorted by name
 */
export function createTreeNodeMatcher(
  part: string,
  isDir: boolean,
  debuggeeHost: ?string
): FindNodeInContentsMatcher {
  if (part === IndexName) {
    // Specialied matcher, when we are looking for "(index)" position.
    return createTreeNodeMatcherWithIndex();
  }
  if (debuggeeHost && isExactDomainMatch(part, debuggeeHost)) {
    // Specialied matcher, when we are looking for domain position.
    return createTreeNodeMatcherWithDebuggeeHost(debuggeeHost);
  }
  // Rest of the cases, without mentioned above.
  return createTreeNodeMatcherWithNameAndOther(part, isDir, debuggeeHost);
}
