/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getProjectDirectoryRoot, getSources } from "../selectors";
import { mapValues, pickBy } from "lodash";
import type { Source } from "../types";
import { getURL } from "../utils/sources-tree";
import { createSelector } from "reselect";

function getRelativeUrl(source: Source, root) {
  const { group, path } = getURL(source);
  if (!root) {
    return path;
  }

  // + 1 removes the leading "/"
  const url = group + path;
  return url.slice(url.indexOf(root) + root.length + 1);
}

function formatSource(source: Source, root): Source {
  // NOTE: Flow https://github.com/facebook/flow/issues/6342 issue
  return ({ ...source, relativeUrl: getRelativeUrl(source, root) }: any);
}

function underRoot(source, root) {
  return source.url && source.url.includes(root);
}

const getSourcesUnderRoot = createSelector(
  getSources,
  getProjectDirectoryRoot,
  (sources, root) => {
    return pickBy(sources, source => underRoot(source, root));
  }
);

/*
 * Gets the sources that are below a project root
 */
export const getRelativeSources = createSelector(
  getSourcesUnderRoot,
  getProjectDirectoryRoot,
  (relativeSources, root) => {
    return mapValues(relativeSources, source => formatSource(source, root));
  }
);
