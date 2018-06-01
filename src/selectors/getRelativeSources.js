/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getProjectDirectoryRoot, getSources } from "../selectors";
import { RelativeSourceRecordClass } from "../reducers/sources";
import type { SourceRecord, RelativeSource } from "../types";
import { getSourcePath } from "../utils/source";
import { createSelector } from "reselect";

function getRelativeUrl(url, root) {
  if (!root) {
    return getSourcePath(url);
  }

  // + 1 removes the leading "/"
  return url.slice(url.indexOf(root) + root.length + 1);
}

function formatSource(source: SourceRecord, root): RelativeSource {
  return new RelativeSourceRecordClass(source).set(
    "relativeUrl",
    getRelativeUrl(source.url, root)
  );
}

/*
 * Gets the sources that are below a project root
 */
export const getRelativeSources = createSelector(
  getSources,
  getProjectDirectoryRoot,
  (sources, root) => {
    return sources
      .filter(source => source.url && source.url.includes(root))
      .map(source => formatSource(source, root));
  }
);
