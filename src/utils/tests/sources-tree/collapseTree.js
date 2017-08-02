import { Map } from "immutable";
import {
  createNode,
  addToTree,
  collapseTree,
  formatTree
} from "../../sources-tree.js";

const abcSource = Map({
  url: "http://example.com/a/b/c.js",
  actor: "actor1"
});
const abcdeSource = Map({
  url: "http://example.com/a/b/c/d/e.js",
  actor: "actor2"
});
const abxSource = Map({
  url: "http://example.com/a/b/x.js",
  actor: "actor3"
});

describe("sources tree - collapseTree", () => {
  it("can collapse a single source", () => {
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcSource);
    expect(fullTree.contents.length).toBe(1);
    const tree = collapseTree(fullTree);

    const host = tree.contents[0];
    expect(host.name).toBe("example.com");
    expect(host.contents.length).toBe(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).toBe("a/b");
    expect(abFolder.contents.length).toBe(1);

    const abcNode = abFolder.contents[0];
    expect(abcNode.name).toBe("c.js");
    expect(abcNode.path).toBe("/example.com/a/b/c.js");
    expect(formatTree(tree)).toMatchSnapshot();
  });

  it("correctly merges in a collapsed source with a deeper level", () => {
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcSource);
    addToTree(fullTree, abcdeSource);
    const tree = collapseTree(fullTree);

    expect(tree.contents.length).toBe(1);

    const host = tree.contents[0];
    expect(host.name).toBe("example.com");
    expect(host.contents.length).toBe(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).toBe("a/b");
    expect(abFolder.contents.length).toBe(2);

    const [cdFolder, abcNode] = abFolder.contents;
    expect(abcNode.name).toBe("c.js");
    expect(abcNode.path).toBe("/example.com/a/b/c.js");
    expect(cdFolder.name).toBe("c/d");

    const [abcdeNode] = cdFolder.contents;
    expect(abcdeNode.name).toBe("e.js");
    expect(abcdeNode.path).toBe("/example.com/a/b/c/d/e.js");
    expect(formatTree(tree)).toMatchSnapshot();
  });

  it("correctly merges in a collapsed source with a shallower level", () => {
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcSource);
    addToTree(fullTree, abxSource);
    const tree = collapseTree(fullTree);

    expect(tree.contents.length).toBe(1);

    const host = tree.contents[0];
    expect(host.name).toBe("example.com");
    expect(host.contents.length).toBe(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).toBe("a/b");
    expect(abFolder.contents.length).toBe(2);

    const [abcNode, abxNode] = abFolder.contents;
    expect(abcNode.name).toBe("c.js");
    expect(abcNode.path).toBe("/example.com/a/b/c.js");
    expect(abxNode.name).toBe("x.js");
    expect(abxNode.path).toBe("/example.com/a/b/x.js");
    expect(formatTree(tree)).toMatchSnapshot();
  });

  it("correctly merges in a collapsed source with the same level", () => {
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcdeSource);
    addToTree(fullTree, abcSource);
    const tree = collapseTree(fullTree);

    expect(tree.contents.length).toBe(1);

    const host = tree.contents[0];
    expect(host.name).toBe("example.com");
    expect(host.contents.length).toBe(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).toBe("a/b");
    expect(abFolder.contents.length).toBe(2);

    const [cdFolder, abcNode] = abFolder.contents;
    expect(abcNode.name).toBe("c.js");
    expect(abcNode.path).toBe("/example.com/a/b/c.js");
    expect(cdFolder.name).toBe("c/d");

    const [abcdeNode] = cdFolder.contents;
    expect(abcdeNode.name).toBe("e.js");
    expect(abcdeNode.path).toBe("/example.com/a/b/c/d/e.js");
    expect(formatTree(tree)).toMatchSnapshot();
  });
});
