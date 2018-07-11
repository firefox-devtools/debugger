import { createSources, getChildNode } from "./helpers";
import { getDescendants, findSourceItem, createTree } from "../index";

function formatDescendants(dir) {
  return getDescendants(dir).map(item => item.path);
}

describe("getDescendants", () => {
  it("gets descendant directories", function() {
    const sources = createSources([
      "http://a/a1.js",
      "http://a/b/b1.js",
      "http://a/b/b2.js",
      "http://a/b/c/c1.js",
      "http://a/b/c/c2.js"
    ]);

    const { sourceTree } = createTree({ sources, debuggeeUrl: "http://a/" });

    const dirA = getChildNode(sourceTree, 0);
    const dirB = getChildNode(sourceTree, 0, 0);
    const dirC = getChildNode(sourceTree, 0, 0, 0);

    expect(formatDescendants(dirA)).toEqual([
      "a/b/c/c1.js",
      "a/b/c/c2.js",
      "a/b/b1.js",
      "a/b/b2.js",
      "a/a1.js"
    ]);

    expect(formatDescendants(dirB)).toEqual([
      "a/b/c/c1.js",
      "a/b/c/c2.js",
      "a/b/b1.js",
      "a/b/b2.js"
    ]);

    expect(formatDescendants(dirC)).toEqual(["a/b/c/c1.js", "a/b/c/c2.js"]);
  });

  it("exclude non-directory descendants", function() {
    const sources = createSources(["http://a/a1.js", "http://b/b1.js"]);
    const { sourceTree } = createTree({ sources, debuggeeUrl: "http://a/" });

    const dirA = getChildNode(sourceTree, 0);
    expect(formatDescendants(dirA)).toEqual(["a/a1.js"]);
  });
});
