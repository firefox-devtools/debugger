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

function isOriginal(originalSource) {
  return !!getGeneratedSourceId(originalSource);
}

function getGeneratedSourceId(originalSource) {
  const match = [...sourceMapConsumers].find(
    ([x, consumer]) => consumer.sources.includes(originalSource.url)
  );

  return match ? match[0] : null;
}

function setSourceMap(source, sourceMap) {
  if (hasConsumer(source.id)) {
    return null;
  }

  const consumer = new SourceMapConsumer(sourceMap);
  sourceMapConsumers.set(source.id, consumer);
  return consumer;
}

function getSourceNode(generatedSourceId, text) {
  if (sourceNodes.has(generatedSourceId)) {
    return sourceNodes.get(generatedSourceId);
  }

  const consumer = getConsumer(generatedSourceId);
  invariant(consumer, "source map must be present");

  const sourceNode = SourceNode.fromStringWithSourceMap(text, consumer);
  sourceNodes.set(generatedSourceId, sourceNode);
  return sourceNode;
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
  originalSource, generatedSource, generatedSourceText
) {
  const sourceNode = getSourceNode(
    generatedSource.id,
    generatedSourceText.text
  );

  const originalSourceContent = sourceNode.sourceContents[originalSource.url];

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
  getGeneratedSourceId
};
