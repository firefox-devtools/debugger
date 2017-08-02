// @flow

import type { SourceRecord } from "../../reducers/types";

/**
 * TODO: createNode is exported so this type could be useful to other modules
 * @memberof utils/sources-tree
 * @static
 */
export type Node = {
  name: string,
  path: string,
  contents: SourceRecord | Array<Node>
};
