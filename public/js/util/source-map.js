const { Task } = require("./task");
const { networkRequest } = require("./networkRequest");
const { SourceMapConsumer, SourceNode } = require("source-map");

let sourceMaps = new Map();

function loadSourceMap(tab, source) {
  const sourceMapURL = `${tab.get("url")}/${source.sourceMapURL}`;

  if (sourceMaps.has(sourceMapURL)) {
    return Promise.resolve(sourceMaps.get(sourceMapURL));
  }

  return networkRequest(sourceMapURL);
}

function getOriginalSources(sourceMap) {
  const consumer = new SourceMapConsumer(sourceMap);
  return consumer.sources;
}

module.exports = {
  loadSourceMap,
  getOriginalSources
}
