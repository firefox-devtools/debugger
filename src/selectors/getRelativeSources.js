/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getProjectDirectoryRoot, getSources } from "../selectors";
import { chain } from "lodash";
import type { Source, RelativeSource } from "../types";
import { getSourcePath } from "../utils/source";
import { createSelector } from "reselect";

function getRelativeUrl(url, root) {
  if (!root) {
    return getSourcePath(url);
  }

  // + 1 removes the leading "/"
  return url.slice(url.indexOf(root) + root.length + 1);
}

function formatSource(source, root): RelativeSource {
  return { ...source, relativeUrl: getRelativeUrl(source.url, root) };
}

function underRoot(source, root) {
  return source.url && source.url.includes(root);
}

/*
 * Gets the sources that are below a project root
 */
export const getRelativeSources = createSelector(
  getSources,
  getProjectDirectoryRoot,
  (sources, root) => {
    const relativeSources: RelativeSource[] = chain(sources)
      .pickBy((source: Source) => underRoot(source, root))
      .mapValues((source: Source) => formatSource(source, root))
      .value();

    return relativeSources;
  }
);
