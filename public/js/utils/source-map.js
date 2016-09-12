const { workerTask } = require("./utils");
const { makeOriginalSource, getGeneratedSourceId } = require("./source-map-utils");

import type { Location } from "./actions/types";

// TODO : in getSource and getSourceByURL => remove the use of the app state
const { getSource, getSourceByURL } = require("../selectors");
const { isEnabled, getValue } = require("../feature");

let sourceMapWorker;
function restartWorker() {
  if (sourceMapWorker) {
    sourceMapWorker.terminate();
  }
  sourceMapWorker = new Worker(
    getValue("baseWorkerURL") + "source-map-worker.js"
  );
}
restartWorker();

function destroy() {
  if (sourceMapWorker) {
    sourceMapWorker.terminate();
    sourceMapWorker = null;
  }
}

const sourceMapTask = function(method) {
  return function() {
    const args = Array.prototype.slice.call(arguments);
    return workerTask(sourceMapWorker, { method, args });
  };
};

const getOriginalSourcePosition = sourceMapTask("getOriginalSourcePosition");
const getGeneratedSourceLocation = sourceMapTask("getGeneratedSourceLocation");
const createOriginalSources = sourceMapTask("createOriginalSources");
const getOriginalSourceUrls = sourceMapTask("getOriginalSourceUrls");
const getOriginalTexts = sourceMapTask("getOriginalTexts");
const createSourceMap = sourceMapTask("createSourceMap");
const clearData = sourceMapTask("clearData");

function _shouldSourceMap(source) {
  return isEnabled("sourceMaps") && source.sourceMapURL;
}

function isMapped(source) {
  return _shouldSourceMap(source);
}

function isOriginal(originalSource) {
  return !!getGeneratedSourceId(originalSource);
}

function isGenerated(source) {
  return !isOriginal(source);
}

// TODO : remove state use
async function getOriginalSources(state: AppState, source: any) {
  const originalSourceUrls = await getOriginalSourceUrls(source);
  return originalSourceUrls.map(url => getSourceByURL(state, url));
}

// TODO : remove state use
function getGeneratedSource(state: AppState, source: any) {
  if (isGenerated(source)) {
    return source;
  }

  const generatedSourceId = getGeneratedSourceId(source);
  const originalSource = getSource(state, generatedSourceId);

  if (originalSource) {
    return originalSource.toJS();
  }

  return source;
}

// TODO : remove the state param
async function getGeneratedLocation(state: AppState, location: Location) {
  // TODO : remove the state param in getSource()
  const source: any = getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (await isOriginal(source.toJS())) {
    return await getGeneratedSourceLocation(source.toJS(), location);
  }

  return location;
}

// TODO : remove the state param
async function getOriginalLocation(state: AppState, location: Location) {
  const source: any = getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (isGenerated(source.toJS())) {
    const originalPosition = await getOriginalSourcePosition(
      source.toJS(),
      location
    );

    const { url, line } = originalPosition;
    if (!url) {
      return {
        sourceId: source.get("id"),
        line: location.line
      };
    }

    // TODO : remove the state param in getSourceByURL()
    const originalSource: any = getSourceByURL(state, url);

    return {
      sourceId: originalSource.get("id"),
      line
    };
  }

  return location;
}

// TODO : remove the state param
async function getOriginalSourceTexts(state, generatedSource, generatedText) {
  if (!_shouldSourceMap(generatedSource)) {
    return [];
  }

  const originalTexts = await getOriginalTexts(
    generatedSource,
    generatedText
  );

  return originalTexts.map(({ text, url }) => {
    // TODO : Remove the state param
    const id = getSourceByURL(state, url).get("id");
    const contentType = "text/javascript";
    return { text, id, contentType };
  });
}

module.exports = {
  getGeneratedLocation,
  getOriginalLocation,
  makeOriginalSource,
  getOriginalSources,
  getGeneratedSource,
  getOriginalSourceTexts,
  getOriginalSourcePosition,
  getGeneratedSourceLocation,
  createOriginalSources,
  getOriginalSourceUrls,
  isOriginal,
  isGenerated,
  isMapped,
  getGeneratedSourceId,
  createSourceMap,
  clearData,
  restartWorker,
  destroy
};
