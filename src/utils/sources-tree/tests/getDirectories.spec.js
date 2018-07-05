import { createSource } from "../../../reducers/sources";

import { getDirectories, createTree } from "../index";

function formatDirectories(source, tree) {
  const paths = getDirectories(source, tree);
  return paths.map(node => node.path);
}

function createSources(urls) {
  return urls.reduce((sources, url, index) => {
    const id = `a${index}`;
    sources[id] = createSource({ url, id });
    return sources;
  }, {});
}

describe("getDirectories", () => {
  it("gets a source's ancestor directories", function() {
    const sources = createSources([
      "http://a/b.js",
      "http://a/c.js",
      "http://b/c.js"
    ]);

    const debuggeeUrl = "http://a/";
    const { sourceTree } = createTree({ sources, debuggeeUrl });
    expect(formatDirectories(sources.a0, sourceTree)).toEqual(["a/b.js", "a"]);
    expect(formatDirectories(sources.a1, sourceTree)).toEqual(["a/c.js", "a"]);
    expect(formatDirectories(sources.a2, sourceTree)).toEqual(["b/c.js", "b"]);
  });
});
