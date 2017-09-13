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
