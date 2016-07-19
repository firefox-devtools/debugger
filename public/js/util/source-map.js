const invariant = require("invariant");
const { SourceMapConsumer, SourceNode } = require("source-map");
const { Source } = require("../types");

let sourceMapConsumers = new Map();
let sourceNodes = new Map();

function _hasConsumer(sourceId) {
  return sourceMapConsumers.has(sourceId);
}

function _getConsumer(sourceId) {
  return sourceMapConsumers.get(sourceId);
}

function _getOriginalSources(sourceId) {
  const consumer = _getConsumer(sourceId);
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
  return [...sourceMapConsumers.keys()].includes(source.id);
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

function getOriginalSource(
  originalSource, generatedSource, generatedSourceText
) {
  const sourceNode = _getSourceNode(
    generatedSource.id,
    generatedSourceText.text
  );

  const originalSourceContent = sourceNode.sourceContents[originalSource.url];

  return {
    source: originalSourceContent,
    contentType: "text/javascript"
  };
}

function createOriginalSources(generatedSource, sourceMap) {
  if (!_hasConsumer(generatedSource.id)) {
    _setConsumer(generatedSource, sourceMap);
  }
  return _getOriginalSources(generatedSource.id)
    .map((source, index) => Source({
      url: source,
      id: generatedSource.id + "/" + index,
      isPrettyPrinted: false
    }));
}

module.exports = {
  getOriginalSource,
  getGeneratedSourceLocation,
  createOriginalSources,
  isOriginal,
  isGenerated,
  getGeneratedSourceId
};
