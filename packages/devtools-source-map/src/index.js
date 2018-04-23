/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

const {
  originalToGeneratedId,
  generatedToOriginalId,
  isGeneratedId,
  isOriginalId
} = require("./utils");

const {
  workerUtils: { WorkerDispatcher }
} = require("devtools-utils");

const dispatcher = new WorkerDispatcher();

const getOriginalURLs = dispatcher.task("getOriginalURLs");
const getGeneratedRanges = dispatcher.task("getGeneratedRanges", {
  queue: true
});
const getGeneratedLocation = dispatcher.task("getGeneratedLocation", {
  queue: true
});
const getAllGeneratedLocations = dispatcher.task("getAllGeneratedLocations", {
  queue: true
});
const getOriginalLocation = dispatcher.task("getOriginalLocation");
const getLocationScopes = dispatcher.task("getLocationScopes");
const getOriginalSourceText = dispatcher.task("getOriginalSourceText");
const applySourceMap = dispatcher.task("applySourceMap");
const clearSourceMaps = dispatcher.task("clearSourceMaps");
const hasMappedSource = dispatcher.task("hasMappedSource");

module.exports = {
  originalToGeneratedId,
  generatedToOriginalId,
  isGeneratedId,
  isOriginalId,
  hasMappedSource,
  getOriginalURLs,
  getGeneratedRanges,
  getGeneratedLocation,
  getAllGeneratedLocations,
  getOriginalLocation,
  getLocationScopes,
  getOriginalSourceText,
  applySourceMap,
  clearSourceMaps,
  startSourceMapWorker: dispatcher.start.bind(dispatcher),
  stopSourceMapWorker: dispatcher.stop.bind(dispatcher)
};
