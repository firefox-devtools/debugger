/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { addToTree } from "./addToTree";
import { collapseTree } from "./collapseTree";
import { createDirectoryNode, createParentMap } from "./utils";
import { getDomain } from "./treeOrder";

import type { SourcesMap } from "../../reducers/types";
import type { TreeDirectory } from "./types";
import { getSourcesUrlsInSources } from "../../selectors";

type Params = {
  sources: SourcesMap,
  debuggeeUrl: string,
  projectRoot: string
};

export function sortQueryString(sources: SourcesMap) {
  if (sources) {
    for (let index = 0; index < Object.keys(sources).length; ) {
      const sourcesArray = Object.values(sources);
      const siblings = getSourcesUrlsInSources(sources, sourcesArray[index]);
      if (siblings.length > 1) {
        siblings.sort();
        siblings.reverse();
        for (let i = 0; i < siblings.length; i++) {
          sourcesArray[index + i].url = siblings[i];
        }
        index += siblings.length;
      } else {
        index++;
      }
    }
  }
}

export function createTree({ sources, debuggeeUrl, projectRoot }: Params) {
  const uncollapsedTree = createDirectoryNode("root", "", []);
  const debuggeeHost = getDomain(debuggeeUrl);

  sortQueryString(sources);
  for (const sourceId in sources) {
    const source = sources[sourceId];
    addToTree(uncollapsedTree, source, debuggeeHost, projectRoot);
  }

  const sourceTree = collapseTree((uncollapsedTree: TreeDirectory));

  return {
    uncollapsedTree,
    sourceTree,
    parentMap: createParentMap(sourceTree),
    focusedItem: null
  };
}
