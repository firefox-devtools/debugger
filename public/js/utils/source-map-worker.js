const { SourceMapConsumer, SourceNode, SourceMapGenerator } = require("source-map");
const toPairs = require("lodash/toPairs");
const includes = require("lodash/includes");

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

function isOriginal(originalSource) {
  return !!getGeneratedSourceId(originalSource);
}

function isGenerated(source) {
  return includes([...sourceMapConsumers.keys()], source.id);
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

function getGeneratedSourceId(originalSource) {
  const match = [...sourceMapConsumers].find(
    ([x, consumer]) => consumer.sources.includes(originalSource.url)
  );

  return match ? match[0] : null;
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

function makeOriginalSource({ url, source, id = 1 }) {
  const generatedSourceId = source.id;
  return {
    url,
    id: JSON.stringify({ generatedSourceId, id }),
    isPrettyPrinted: false
  };
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
  isOriginal,
  isGenerated,
  getGeneratedSourceId,
  createSourceMap,
  makeOriginalSource,
  clearData
};

self.onmessage = function(msg) {
  const { method, args } = msg.data;
  const response = publicInterface[method].apply(undefined, args);
  self.postMessage(response);
};
