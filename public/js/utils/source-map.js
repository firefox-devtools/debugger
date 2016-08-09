const { workerTask } = require("./utils");

import type { Location } from "./actions/types";

const { getSource, getSourceByURL } = require("../selectors");
const { isEnabled, getValue } = require("../feature");

const sourceMapWorker = new Worker(
  getValue("baseWorkerURL") + "source-map-worker.js"
);
const sourceMapTask = function(method) {
  return function() {
    const args = Array.prototype.slice.call(arguments);
    return workerTask(sourceMapWorker, { method, args });
  };
};

function makeOriginalSource({ url, source, id = 1 }) {
  const generatedSourceId = source.id;
  return {
    url,
    id: JSON.stringify({ generatedSourceId, id }),
    isPrettyPrinted: false
  };
}

const getOriginalSourcePosition = sourceMapTask("getOriginalSourcePosition");
const getGeneratedSourceLocation = sourceMapTask("getGeneratedSourceLocation");
const createOriginalSources = sourceMapTask("createOriginalSources");
const getOriginalSourceUrls = sourceMapTask("getOriginalSourceUrls");
const getOriginalTexts = sourceMapTask("getOriginalTexts");
const isOriginal = sourceMapTask("isOriginal");
const isGenerated = sourceMapTask("isGenerated");
const getGeneratedSourceId = sourceMapTask("getGeneratedSourceId");
const createSourceMap = sourceMapTask("createSourceMap");
const clearData = sourceMapTask("clearData");

function _shouldSourceMap(generatedSource) {
  return isEnabled("sourceMaps") && generatedSource.sourceMapURL;
}

async function getOriginalSources(state: AppState, source: any) {
  const originalSourceUrls = await getOriginalSourceUrls(source);
  return originalSourceUrls.map(url => getSourceByURL(state, url));
}

async function getGeneratedSource(state: AppState, source: any) {
  if (await isGenerated(source)) {
    return source;
  }

  const generatedSourceId = await getGeneratedSourceId(source);
  const originalSource = getSource(state, generatedSourceId);

  if (originalSource) {
    return originalSource.toJS();
  }

  return source;
}

async function getGeneratedLocation(state: AppState, location: Location) {
  const source: any = getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (await isOriginal(source.toJS())) {
    return await getGeneratedSourceLocation(source.toJS(), location);
  }

  return location;
}

async function getOriginalLocation(state: AppState, location: Location) {
  const source: any = getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  const _isGenerated = await isGenerated(source.toJS());

  if (_isGenerated) {
    const originalPosition = await getOriginalSourcePosition(
      source.toJS(),
      location
    );

    const { url, line } = originalPosition;

    const originalSource: any = getSourceByURL(state, url);
    return {
      sourceId: originalSource.get("id"),
      line
    };
  }

  return location;
}

async function getOriginalSourceTexts(state, generatedSource, generatedText) {
  if (!_shouldSourceMap(generatedSource)) {
    return [];
  }

  const originalTexts = await getOriginalTexts(
    generatedSource,
    generatedText
  );

  return originalTexts.map(({ text, url }) => {
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
  getOriginalTexts,
  isOriginal,
  isGenerated,
  getGeneratedSourceId,
  createSourceMap,
  clearData
};
