const URL = require("url");
const md5 = require("md5");
const { SourceMapConsumer, SourceMapGenerator } = require("source-map");
const path = require("./path");
const networkRequest = require("./networkRequest");
const { getSource } = require("../selectors");
const { isEnabled } = require("../feature");
const { isJavaScript } = require("./source");
const assert = require("./assert");

import type { Location } from "./actions/types";

let sourceMapRequests = new Map();

function clearSourceMaps() {
  sourceMapRequests = new Map();
}

function _resolveSourceMapURL(source) {
  if (path.isURL(source.sourceMapURL) || !source.url) {
    // If it's already a full URL or the source doesn't have a URL,
    // don't resolve anything.
    return source.sourceMapURL;
  } else if (path.isAbsolute(source.sourceMapURL)) {
    // If it's an absolute path, it should be resolved relative to the
    // host of the source.
    const urlObj = URL.parse(source.url);
    const base = urlObj.protocol + "//" + urlObj.host;
    return base + source.sourceMapURL;
  }
  // Otherwise, it's a relative path and should be resolved relative
  // to the source.
  return path.dirname(source.url) + "/" + source.sourceMapURL;
}

/**
 * Sets the source map's sourceRoot to be relative to the source map url.
 */
function _setSourceMapRoot(sourceMap, absSourceMapURL, source) {
  // No need to do this fiddling if we won't be fetching any sources over the
  // wire.
  if (sourceMap.hasContentsOfAllSources()) {
    return;
  }

  const base = path.dirname(
    (absSourceMapURL.indexOf("data:") === 0 && source.url) ?
      source.url :
      absSourceMapURL
  );

  if (sourceMap.sourceRoot) {
    sourceMap.sourceRoot = path.join(base, sourceMap.sourceRoot);
  } else {
    sourceMap.sourceRoot = base;
  }

  return sourceMap;
}

function originalToGeneratedId(originalId) {
  const match = originalId.match(/(.*)\/originalSource/);
  return match ? match[1] : null;
}

function generatedToOriginalId(generatedId, url) {
  return generatedId + "/originalSource-" + md5(url);
}

function isOriginalId(id) {
  return id.match(/\/originalSource/);
}

function isGeneratedId(id) {
  return !isOriginalId(id);
}

async function _fetchSourceMap(generatedSource) {
  // Fetch the sourcemap over the network and create it.
  const sourceMapURL = _resolveSourceMapURL(generatedSource);
  const fetched = await networkRequest(
    sourceMapURL, { loadFromCache: false }
  );

  // Create the source map and fix it up.
  const map = new SourceMapConsumer(fetched.content);
  _setSourceMapRoot(map, sourceMapURL, generatedSource);
  return map;
}

function fetchSourceMap(generatedSource) {
  const existingRequest = sourceMapRequests.get(generatedSource.id);

  if (!generatedSource.sourceMapURL || !isEnabled("sourceMaps")) {
    return Promise.resolve(null);
  } else if (existingRequest) {
    // If it has already been requested, return the request. An
    // important behavior here is that if it's in the middle of
    // requesting it, all subsequent calls will block on the initial
    // request.
    return existingRequest;
  }

  // Fire off the request, set it in the cache, and return it.
  const req = _fetchSourceMap(generatedSource);
  sourceMapRequests.set(generatedSource.id, req);
  return req;
}

function getSourceMap(generatedSourceId) {
  return sourceMapRequests.get(generatedSourceId);
}

function applySourceMap(generatedId, url, code, mappings) {
  const generator = new SourceMapGenerator({ file: url });
  mappings.forEach(mapping => generator.addMapping(mapping));
  generator.setSourceContent(url, code);

  const map = SourceMapConsumer(generator.toJSON());
  sourceMapRequests.set(generatedId, Promise.resolve(map));
  return map;
}

async function getGeneratedLocation(location: Location, state) {
  if (!isOriginalId(location.sourceId)) {
    return location;
  }

  const originalSource = getSource(state, location.sourceId).toJS();
  const generatedSourceId = originalToGeneratedId(location.sourceId);
  const map = await getSourceMap(generatedSourceId);
  if (!map) {
    return location;
  }

  const { line, column } = map.generatedPositionFor({
    source: originalSource.url,
    line: location.line,
    column: location.column == null ? 0 : location.column
  });

  return {
    sourceId: generatedSourceId,
    line: line,
    // Treat 0 as no column so that line breakpoints work correctly.
    column: column === 0 ? undefined : column
  };
}

async function getOriginalLocation(location: Location) {
  if (!isGeneratedId(location.sourceId)) {
    return location;
  }

  const map = await getSourceMap(location.sourceId);
  if (!map) {
    return location;
  }

  const { source: url, line, column } = map.originalPositionFor({
    line: location.line,
    column: location.column == null ? Infinity : location.column
  });

  if (url == null) {
    // No url means the location didn't map.
    return location;
  }

  return {
    sourceId: generatedToOriginalId(location.sourceId, url),
    line,
    column
  };
}

async function getOriginalSourceText(originalSource) {
  assert(isOriginalId(originalSource.id),
         "Source is not an original source");

  const generatedSourceId = originalToGeneratedId(originalSource.id);
  const map = await getSourceMap(generatedSourceId);
  if (!map) {
    return null;
  }

  let text = map.sourceContentFor(originalSource.url);
  if (!text) {
    text = (await networkRequest(
      originalSource.url, { loadFromCache: false }
    )).content;
  }

  return {
    text,
    contentType: isJavaScript(originalSource.url) ?
      "text/javascript" :
      "text/plain"
  };
}

module.exports = {
  originalToGeneratedId,
  generatedToOriginalId,
  isGeneratedId,
  isOriginalId,

  fetchSourceMap,
  getGeneratedLocation,
  getOriginalLocation,
  getOriginalSourceText,
  applySourceMap,
  clearSourceMaps
};
