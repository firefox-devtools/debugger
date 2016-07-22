const invariant = require("invariant");
const toPairs = require("lodash/toPairs");
const includes = require("lodash/includes");
const { SourceMapConsumer, SourceNode, SourceMapGenerator } = require("source-map");
const { Source } = require("../types");

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
  invariant(consumer, "source map must be present");

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
  const generatedLocation = consumer.generatedPositionFor({
    source: originalSource.url,
    line: originalLocation.line,
    column: 0
  });

  return {
    sourceId: generatedSourceId,
    line: generatedLocation.line
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

function getOriginalSourcePosition(generatedSource, location) {
  const consumer = _getConsumer(generatedSource.id);
  const position = consumer.originalPositionFor({
    line: location.line,
    column: 0
  });

  return {
    url: position.source,
    line: position.line
  };
}

function createOriginalSources(generatedSource, sourceMap) {
  if (!_hasConsumer(generatedSource.id)) {
    _setConsumer(generatedSource, sourceMap);
  }

  return getOriginalSourceUrls(generatedSource)
    .map((source, index) => Source({
      url: source,
      id: generatedSource.id + "/" + index,
      isPrettyPrinted: false
    }));
}

function createSourceMap({ source, mappings, code }) {
  const generator = new SourceMapGenerator({ file: source.url });
  mappings.forEach(mapping => generator.addMapping(mapping));
  generator.setSourceContent(source.url, code);

  let consumer = SourceMapConsumer.fromSourceMap(generator);
  _setConsumer(source, consumer);
  return generator.toJSON();
}

module.exports = {
  getOriginalSourcePosition,
  getGeneratedSourceLocation,
  createOriginalSources,
  getOriginalSourceUrls,
  getOriginalTexts,
  isOriginal,
  isGenerated,
  getGeneratedSourceId,
  createSourceMap
};
