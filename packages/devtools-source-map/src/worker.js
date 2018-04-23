/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const {
  getOriginalURLs,
  getGeneratedRanges,
  getGeneratedLocation,
  getAllGeneratedLocations,
  getOriginalLocation,
  getOriginalSourceText,
  getLocationScopes,
  hasMappedSource,
  applySourceMap
} = require("./source-map");

const { clearSourceMaps } = require("./utils/sourceMapRequests");

const {
  workerUtils: { workerHandler }
} = require("devtools-utils");

// The interface is implemented in source-map to be
// easier to unit test.
self.onmessage = workerHandler({
  getOriginalURLs,
  getGeneratedRanges,
  getGeneratedLocation,
  getAllGeneratedLocations,
  getOriginalLocation,
  getLocationScopes,
  getOriginalSourceText,
  hasMappedSource,
  applySourceMap,
  clearSourceMaps
});
