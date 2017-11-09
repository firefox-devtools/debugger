/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Node } from "./types";

export function formatTree(tree: Node, depth: number = 0, str: string = "") {
  const whitespace = new Array(depth * 2).join(" ");

  if (Array.isArray(tree.contents)) {
    str += `${whitespace} - ${tree.name} path=${tree.path} \n`;
    tree.contents.forEach(t => {
      str = formatTree(t, depth + 1, str);
    });
  } else {
    const id = tree.contents.get("id");
    str += `${whitespace} - ${tree.name} path=${tree.path} source_id=${id} \n`;
  }

  return str;
}
