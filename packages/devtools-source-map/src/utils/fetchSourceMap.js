/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

const { networkRequest } = require("devtools-utils");
const { getSourceMap, setSourceMap } = require("./sourceMapRequests");
const { WasmRemap } = require("./wasmRemap");
const { SourceMapConsumer } = require("source-map");

import type { Source } from "debugger-html";

function _resolveSourceMapURL(source: Source) {
  const { url = "", sourceMapURL = "" } = source;

  if (!url) {
    // If the source doesn't have a URL, don't resolve anything.
    return { sourceMapURL, baseURL: sourceMapURL };
  }

  const resolvedURL = new URL(sourceMapURL, url);
  const resolvedString = resolvedURL.toString();

  let baseURL = resolvedString;
  // When the sourceMap is a data: URL, fall back to using the
  // source's URL, if possible.
  if (resolvedURL.protocol == "data:") {
    baseURL = url;
  }

  return { sourceMapURL: resolvedString, baseURL };
}

async function _resolveAndFetch(generatedSource: Source): SourceMapConsumer {
  // Fetch the sourcemap over the network and create it.
  const { sourceMapURL, baseURL } = _resolveSourceMapURL(generatedSource);

  const fetched = await networkRequest(sourceMapURL, { loadFromCache: false });

  // Create the source map and fix it up.
  let map = new SourceMapConsumer(fetched.content, baseURL);
  if (generatedSource.isWasm) {
    map = new WasmRemap(map);
  }

  return map;
}

function fetchSourceMap(generatedSource: Source) {
  const existingRequest = getSourceMap(generatedSource.id);

  // If it has already been requested, return the request. Make sure
  // to do this even if sourcemapping is turned off, because
  // pretty-printing uses sourcemaps.
  //
  // An important behavior here is that if it's in the middle of
  // requesting it, all subsequent calls will block on the initial
  // request.
  if (existingRequest) {
    return existingRequest;
  }

  if (!generatedSource.sourceMapURL) {
    return null;
  }

  // Fire off the request, set it in the cache, and return it.
  const req = _resolveAndFetch(generatedSource);
  // Make sure the cached promise does not reject, because we only
  // want to report the error once.
  setSourceMap(generatedSource.id, req.catch(() => null));
  return req;
}

module.exports = { fetchSourceMap };
