import { Map } from "immutable";
import { updateTree, createTree } from "../index";
import { createNode } from "../utils";

function createSourcesMap(sources) {
  const msources = sources.map((s, i) => new Map(s));
  let sourcesMap = Map();
  msources.forEach(s => {
    sourcesMap = sourcesMap.mergeIn([s.get("id")], s);
  });

  return sourcesMap;
}

function formatTree(tree) {
  return JSON.stringify(tree.uncollapsedTree, null, 2);
}

const sources = [
  {
    id: "server1.conn13.child1/39",
    url: "https://davidwalsh.name/"
  },
  {
    id: "server1.conn13.child1/37",
    url: "https://davidwalsh.name/source1.js"
  },
  {
    id: "server1.conn13.child1/40",
    url: "https://davidwalsh.name/source2.js"
  }
];

const debuggeeUrl = "blah";

describe("calls updateTree.js", () => {
  it("adds one source", () => {
    const prevSources = createSourcesMap([sources[0]]);

    const { sourceTree, uncollapsedTree } = createTree({
      debuggeeUrl,
      sources: prevSources
    });

    const newTree = updateTree({
      debuggeeUrl,
      prevSources,
      newSources: createSourcesMap([sources[0], sources[1]]),
      uncollapsedTree,
      sourceTree
    });

    expect(formatTree(newTree)).toMatchSnapshot();
  });

  it("adds two sources", () => {
    const prevSources = createSourcesMap([sources[0]]);

    const { sourceTree, uncollapsedTree } = createTree({
      debuggeeUrl,
      sources: prevSources
    });

    const newTree = updateTree({
      debuggeeUrl,
      prevSources,
      newSources: createSourcesMap([sources[0], sources[1], sources[2]]),
      uncollapsedTree,
      sourceTree
    });

    expect(formatTree(newTree)).toMatchSnapshot();
  });

  // NOTE: we currently only add sources to the tree and clear the tree
  // on navigate.
  it("shows all the sources", () => {
    const prevSources = createSourcesMap([sources[0]]);

    const { sourceTree, uncollapsedTree } = createTree({
      debuggeeUrl,
      sources: prevSources
    });

    const newTree = updateTree({
      debuggeeUrl,
      prevSources,
      newSources: createSourcesMap([sources[1]]),
      uncollapsedTree,
      sourceTree
    });

    expect(formatTree(newTree)).toMatchSnapshot();
  });
});
