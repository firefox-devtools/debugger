const networkRequest = require("devtools-network-request");
const URL = require("url");
const path = require("./path");
const { SourceMapConsumer, SourceMapGenerator } = require("source-map");
const { isJavaScript } = require("./source");
const assert = require("./assert");
const {
  originalToGeneratedId,
  generatedToOriginalId,
  isGeneratedId,
  isOriginalId
} = require("./source-map-util");

let sourceMapRequests = new Map();
let sourceMapsEnabled = false;

function clearSourceMaps() {
  sourceMapRequests.clear();
}

function enableSourceMaps() {
  sourceMapsEnabled = true;
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

function _getSourceMap(generatedSourceId) {
  return sourceMapRequests.get(generatedSourceId);
}

async function _resolveAndFetch(generatedSource) {
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

function _fetchSourceMap(generatedSource) {
  const existingRequest = sourceMapRequests.get(generatedSource.id);
  if (existingRequest) {
    // If it has already been requested, return the request. Make sure
    // to do this even if sourcemapping is turned off, because
    // pretty-printing uses sourcemaps.
    //
    // An important behavior here is that if it's in the middle of
    // requesting it, all subsequent calls will block on the initial
    // request.
    return existingRequest;
  } else if (!generatedSource.sourceMapURL || !sourceMapsEnabled) {
    return Promise.resolve(null);
  }

  // Fire off the request, set it in the cache, and return it.
  const req = _resolveAndFetch(generatedSource);
  sourceMapRequests.set(generatedSource.id, req);
  return req;
}

async function getOriginalURLs(generatedSource) {
  const map = await _fetchSourceMap(generatedSource);
  return map && map.sources;
}

async function getGeneratedLocation(location: Location, originalSource) {
  if (!isOriginalId(location.sourceId)) {
    return location;
  }

  const generatedSourceId = originalToGeneratedId(location.sourceId);
  const map = await _getSourceMap(generatedSourceId);
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

  const map = await _getSourceMap(location.sourceId);
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
  const map = await _getSourceMap(generatedSourceId);
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

function applySourceMap(generatedId, url, code, mappings) {
  const generator = new SourceMapGenerator({ file: url });
  mappings.forEach(mapping => generator.addMapping(mapping));
  generator.setSourceContent(url, code);

  const map = SourceMapConsumer(generator.toJSON());
  sourceMapRequests.set(generatedId, Promise.resolve(map));
}

const publicInterface = {
  getOriginalURLs,
  getGeneratedLocation,
  getOriginalLocation,
  getOriginalSourceText,
  enableSourceMaps,
  applySourceMap,
  clearSourceMaps
};

self.onmessage = function(msg) {
  const { id, method, args } = msg.data;
  const response = publicInterface[method].apply(undefined, args);
  if (response instanceof Promise) {
    response.then(val => self.postMessage({ id, response: val }),
                  err => self.postMessage({ id, error: err }));
  } else {
    self.postMessage({ id, response });
  }
};

