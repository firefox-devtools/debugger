const invariant = require("invariant");
const { SourceMapConsumer, SourceNode } = require("source-map");
const { Source } = require("../types");

let sourceMapConsumers = new Map();
let sourceNodes = new Map();

function hasConsumer(sourceId) {
  return sourceMapConsumers.has(sourceId);
}

function getConsumer(sourceId) {
  return sourceMapConsumers.get(sourceId);
}

function getOriginalSources(sourceId) {
  const consumer = getConsumer(sourceId);
  return consumer.sources;
}

function isGenerated(source) {
  return [...sourceMapConsumers.keys()].includes(source.id);
}

function isOriginal(source) {
  return !!getGeneratedSourceId(source);
}

function getGeneratedSourceId(originalSource) {
  const match = [...sourceMapConsumers].find(
    ([x, consumer]) => consumer.sources.includes(originalSource.url)
  );

  return match ? match[0] : null;
}

function getGeneratedSourceLocation(originalSource, originalLocation) {
  const generatedSourceId = getGeneratedSourceId(originalSource);
  const consumer = getConsumer(generatedSourceId);
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

function getOriginalSourcePosition(source, location) {
  const consumer = getConsumer(source.id);
  const position = consumer.originalPositionFor({
    line: location.line,
    column: 0
  });

  return {
    url: position.source,
    line: position.line
  };
}

function setSourceMap(source, sourceMap) {
  if (hasConsumer(source.id)) {
    return null;
  }

  const consumer = new SourceMapConsumer(sourceMap);
  sourceMapConsumers.set(source.id, consumer);
  return consumer;
}

function setSourceNode(generatedSourceId, text) {
  if (sourceNodes.has(generatedSourceId)) {
    return getSourceNode(generatedSourceId);
  }

  const consumer = getConsumer(generatedSourceId);
  invariant(consumer, "source map must be present");

  const sourceNode = SourceNode.fromStringWithSourceMap(text, consumer);
  sourceNodes.set(generatedSourceId, sourceNode);
  return sourceNode;
}

function getSourceNode(generatedSourceId) {
  return sourceNodes.get(generatedSourceId);
}

function getOriginalSourceContent(originalSource, generatedSource, text) {
  const sourceNode = setSourceNode(generatedSource.id, text);
  invariant(sourceNode, "source node must be present");

  return sourceNode.sourceContents[originalSource.url];
}

function createOriginalSources(generatedSource) {
  return getOriginalSources(generatedSource.id)
    .map((source, index) => Source({
      url: source,
      id: generatedSource.id + "/" + index,
      isPrettyPrinted: false
    }));
}

function getOriginalSource(
  originalSource, generatedSource, generatedSourceText) {
  const originalSourceContent = getOriginalSourceContent(
    originalSource,
    generatedSource,
    generatedSourceText.text
  );

  return {
    source: originalSourceContent,
    contentType: "text/javascript"
  };
}

module.exports = {
  setSourceMap,
  getOriginalSource,
  createOriginalSources,
  isOriginal,
  getGeneratedSourceLocation,
  getGeneratedSourceId,
  isGenerated,
  getOriginalSourcePosition
};
