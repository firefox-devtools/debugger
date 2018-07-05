// @flow

import { flatten } from "lodash";
import type { TreeNode } from "./types";

export function getDescendants(item: TreeNode) {
  if (item.type === "directory") {
    return flatten(item.contents.map(getDescendants));
  }

  return [item];
}
