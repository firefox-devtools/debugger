/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { TreeNode } from "./types";

export function formatTree(
  tree: TreeNode,
  depth: number = 0,
  str: string = ""
) {
  const whitespace = new Array(depth * 2).join(" ");

  if (tree.type === "directory") {
    str += `${whitespace} - ${tree.name} path=${tree.path} \n`;
    tree.contents.forEach(t => {
      str = formatTree(t, depth + 1, str);
    });
  } else {
    const id = tree.contents.id;
    str += `${whitespace} - ${tree.name} path=${tree.path} source_id=${id} \n`;
  }

  return str;
}
