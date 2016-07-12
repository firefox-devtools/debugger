"use strict";

const { networkRequest } = require("./networkRequest");
const { SourceMapConsumer } = require("source-map");

let sourceMaps = new Map();

function loadSourceMap(tab, source) {
  const sourceMapURL = `${tab.get("url")}/${source.sourceMapURL}`;

  if (sourceMaps.has(source.id)) {
    return Promise.resolve(sourceMaps.get(source.id));
  }

  return networkRequest(sourceMapURL).then(sourceMap => {
    sourceMaps.set(source.id, sourceMap);
    return sourceMap;
  });
}

function getOriginalSources(sourceMap) {
  const consumer = new SourceMapConsumer(sourceMap);
  return consumer.sources;
}

module.exports = {
  loadSourceMap,
  getOriginalSources
};
