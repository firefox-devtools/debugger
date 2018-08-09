/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const {
  getOriginalURLs,
  getOriginalRanges,
  getGeneratedRanges,
  getGeneratedLocation,
  getAllGeneratedLocations,
  getOriginalLocation,
  getOriginalSourceText,
  getLocationScopes,
  hasMappedSource,
  clearSourceMaps,
  applySourceMap
} = require("./source-map");

const { getOriginalStackFrames } = require("./utils/getOriginalStackFrames");

const {
  workerUtils: { workerHandler }
} = require("devtools-utils");

// The interface is implemented in source-map to be
// easier to unit test.
self.onmessage = workerHandler({
  getOriginalURLs,
  getOriginalRanges,
  getGeneratedRanges,
  getGeneratedLocation,
  getAllGeneratedLocations,
  getOriginalLocation,
  getLocationScopes,
  getOriginalSourceText,
  getOriginalStackFrames,
  hasMappedSource,
  applySourceMap,
  clearSourceMaps
});
