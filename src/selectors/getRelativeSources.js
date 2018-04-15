/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getProjectDirectoryRoot, getSources } from "../selectors";
import type { State } from "../reducers/types";
import type { Source } from "../types";
import { getSourcePath } from "../utils/source";

export type RelativeSource = Source & {
  +relativeUrl: string
};

function getRelativeUrl(url, root) {
  if (!root) {
    return getSourcePath(url);
  }

  // + 1 removes the leading "/"
  return url.slice(url.indexOf(root) + root.length + 1);
}

function formatSource(source: Source, root): RelativeSource {
  return {
    ...source,
    relativeUrl: getRelativeUrl(source.url, root)
  };
}

/*
 * Gets the sources that are below a project root
 */
export function getRelativeSources(state: State): RelativeSource[] {
  const sources = getSources(state);
  const root = getProjectDirectoryRoot(state);
  return sources
    .valueSeq()
    .toJS()
    .filter(({ url }) => url && url.includes(root))
    .map(source => formatSource(source, root));
}
