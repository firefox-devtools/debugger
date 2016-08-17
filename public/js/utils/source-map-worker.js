const { SourceMapConsumer, SourceNode, SourceMapGenerator } = require("source-map");
const { makeOriginalSource, getGeneratedSourceId } = require("./source-map-utils");

const toPairs = require("lodash/toPairs");

let sourceMapConsumers = new Map();
let sourceNodes = new Map();

function _hasConsumer(sourceId) {
  return sourceMapConsumers.has(sourceId);
}

function _getConsumer(sourceId) {
  return sourceMapConsumers.get(sourceId);
}

function getOriginalSourceUrls(source) {
  const consumer = _getConsumer(source.id);
  if (!consumer) {
    return [];
  }

  return consumer.sources;
}

function _setConsumer(source, sourceMap) {
  if (_hasConsumer(source.id)) {
    return null;
  }

  const consumer = new SourceMapConsumer(sourceMap);
  sourceMapConsumers.set(source.id, consumer);
  return consumer;
}

function _getSourceNode(generatedSourceId, text) {
  if (sourceNodes.has(generatedSourceId)) {
    return sourceNodes.get(generatedSourceId);
  }

  const consumer = _getConsumer(generatedSourceId);
  if (!consumer) {
    return;
  }

  const sourceNode = SourceNode.fromStringWithSourceMap(text, consumer);
  sourceNodes.set(generatedSourceId, sourceNode);
  return sourceNode;
}

function getGeneratedSourceLocation(originalSource, originalLocation) {
  const generatedSourceId = getGeneratedSourceId(originalSource);
  const consumer = _getConsumer(generatedSourceId);
  let { column, line } = consumer.generatedPositionFor({
    source: originalSource.url,
    line: originalLocation.line,
    column: 0
  });

  // The debugger server expects line breakpoints to have a column undefined
  if (column == 0) {
    column = undefined;
  }

  return {
    sourceId: generatedSourceId,
    line,
    column
  };
}

function getOriginalTexts(generatedSource, generatedText) {
  const sourceNode = _getSourceNode(
    generatedSource.id,
    generatedText
  );

  return toPairs(sourceNode.sourceContents)
    .map(([ url, text ]) => ({ url, text }));
}

function getOriginalSourcePosition(generatedSource, { column, line }) {
  const consumer = _getConsumer(generatedSource.id);

  // if there is not a consumer, then its a generated source without a map
  if (!consumer) {
    return {
      url: generatedSource.url,
      line,
      column
    };
  }

  // The source-map library expects line breakpoints to be 0
  if (column == undefined) {
    column = 0;
  }

  const position = consumer.originalPositionFor({ line, column });

  return {
    url: position.source,
    line: position.line,
    column: 0
  };
}

function createOriginalSources(generatedSource, sourceMap) {
  if (!_hasConsumer(generatedSource.id)) {
    _setConsumer(generatedSource, sourceMap);
  }

  return getOriginalSourceUrls(generatedSource)
    .map((url, index) => makeOriginalSource({
      source: generatedSource,
      url,
      id: index
    }));
}

function createSourceMap({ source, mappings, code }) {
  const generator = new SourceMapGenerator({ file: source.url });
  mappings.forEach(mapping => generator.addMapping(mapping));
  generator.setSourceContent(source.url, code);

  _setConsumer(source, generator.toJSON());
  return generator.toJSON();
}

function clearData() {
  sourceMapConsumers.clear();
  sourceNodes.clear();
}

const publicInterface = {
  getOriginalSourcePosition,
  getGeneratedSourceLocation,
  createOriginalSources,
  getOriginalSourceUrls,
  getOriginalTexts,
  createSourceMap,
  clearData
};

self.onmessage = function(msg) {
  const { method, args } = msg.data;
  const response = publicInterface[method].apply(undefined, args);
  self.postMessage(response);
};
