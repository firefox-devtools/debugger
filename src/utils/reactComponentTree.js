/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

export default () => {
  function getPaths(node, path) {
    if (!node) {
      return {};
    }

    let siblings = {};
    if (node.sibling) {
      const end = path.slice(-1)[0];
      const start = path.slice(0, -1);
      siblings = getPaths(node.sibling, [...start, end + 1]);
    }

    let children = {};
    if (node.child) {
      children = getPaths(node.child, [...path, 0]);
    }

    return Object.assign({}, children, siblings, { [node._debugID]: path });
  }

  function getNode(node, path) {
    if (path.length === 0) {
      return null;
    }

    const [start, ...rest] = path;

    if (start === 0) {
      if (rest.length == 0) {
        return node;
      }
      return getNode(node.child, rest);
    }

    if (node.sibling) {
      return getNode(node.sibling, [start - 1, ...rest]);
    }

    return null;
  }

  function _getAncestors(node, path) {
    const ancestors = [];

    while (path.length > 1) {
      path = path.slice(0, -1);
      ancestors.push(getNode(node, path));
    }

    return ancestors;
  }

  function getAncestors(context) {
    const node = context._reactInternalFiber;
    const root = getRoot(node);
    const paths = getPaths(root, [0]);
    const ancestors = _getAncestors(root, paths[node._debugID]);
    return [node, ...ancestors].map(formatNode).reverse();
  }

  function formatNode(node) {
    return {
      id: node._debugID,
      name: node.type.name || node.type || "",
      class: node.type,
      hasChildren: !!node.child,
      node: { props: node.memoizedProps, state: node.memoizedState }
    };
  }

  function getRoot(node) {
    let root = node;
    let ancestor = node;

    while (ancestor) {
      root = ancestor;
      ancestor = ancestor._debugOwner;
    }

    return root;
  }

  return {
    getAncestors
  };
};
