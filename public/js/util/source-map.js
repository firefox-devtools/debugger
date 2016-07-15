const invariant = require("invariant");
const { SourceMapConsumer, SourceNode } = require("source-map");
const { Source } = require("../types");
const { Task } = require("./task");
const { getSource } = require("../selectors");

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

function getOriginalSourceContent(originalSource, generatedSource, text) {
  const sourceNode = getSourceNode(generatedSource.get("id"), text);
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

function getOriginalSource(originalSource, getState, dispatch, loadSourceText) {
  return Task.spawn(function* () {
    const generatedSource = getSource(
      getState(),
      getGeneratedSourceId(originalSource)
    );

    const generatedSourcetext = yield dispatch(
      loadSourceText(generatedSource.toJS())
    );

    const originalSourceContent = getOriginalSourceContent(
      originalSource,
      generatedSource,
      generatedSourcetext.text
    );

    return {
      source: originalSourceContent,
      contentType: "text/javascript"
    };
  });
}

module.exports = {
  setSourceMap,
  getOriginalSource,
  createOriginalSources,
  isOriginal,
};
