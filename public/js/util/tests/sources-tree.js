"use strict";

const expect = require("expect.js");
const { Map } = require("immutable");
const {
  createNode, nodeHasChildren, addToTree
} = require("../sources-tree.js");

describe("sources-tree", () => {
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
  const abcHashSource = Map({
    url: "http://example.com/a/b/c.js#d/e?f=g",
    actor: "actor1"
  });

  it("should provide node API", () => {
    const root = createNode("root", "", [createNode("foo", "/foo")]);
    expect(root.name).to.be("root");
    expect(nodeHasChildren(root)).to.be(true);
    expect(root.contents.length).to.be(1);

    const child = root.contents[0];
    expect(child.name).to.be("foo");
    expect(child.path).to.be("/foo");
    expect(child.contents).to.be(null);
    expect(nodeHasChildren(child)).to.be(false);
  });

  it("builds a path-based tree", () => {
    const source1 = Map({
      url: "http://example.com/foo/source1.js",
      actor: "actor1"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source1);
    expect(tree.contents.length).to.be(1);

    let base = tree.contents[0];
    expect(base.name).to.be("example.com");
    expect(base.contents.length).to.be(1);

    let fooNode = base.contents[0];
    expect(fooNode.name).to.be("foo");
    expect(fooNode.contents.length).to.be(1);

    let source1Node = fooNode.contents[0];
    expect(source1Node.name).to.be("source1.js");
  });

  it("alphabetically sorts children", () => {
    const source1 = Map({
      url: "http://example.com/source1.js",
      actor: "actor1"
    });
    const source2 = Map({
      url: "http://example.com/foo/b_source2.js",
      actor: "actor2"
    });
    const source3 = Map({
      url: "http://example.com/foo/a_source3.js",
      actor: "actor3"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source1);
    addToTree(tree, source2);
    addToTree(tree, source3);

    let base = tree.contents[0];
    let fooNode = base.contents[0];
    expect(fooNode.name).to.be("foo");
    expect(fooNode.contents.length).to.be(2);

    let source1Node = base.contents[1];
    expect(source1Node.name).to.be("source1.js");

    // source2 should be after source1 alphabetically
    let source2Node = fooNode.contents[1];
    let source3Node = fooNode.contents[0];
    expect(source2Node.name).to.be("b_source2.js");
    expect(source3Node.name).to.be("a_source3.js");
  });

  it("can collapse a single source", () => {
    const tree = createNode("root", "", []);
    addToTree(tree, abcSource);
    expect(tree.contents.length).to.be(1);

    const host = tree.contents[0];
    expect(host.name).to.be("example.com");
    expect(host.contents.length).to.be(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).to.be("a/b");
    expect(abFolder.contents.length).to.be(1);

    const abcNode = abFolder.contents[0];
    expect(abcNode.name).to.be("c.js");
    expect(abcNode.path).to.be("/example.com/a/b/c.js");
  });

  it("correctly merges in a collapsed source with a deeper level", () => {
    const tree = createNode("root", "", []);
    addToTree(tree, abcSource);
    addToTree(tree, abcdeSource);
    expect(tree.contents.length).to.be(1);

    const host = tree.contents[0];
    expect(host.name).to.be("example.com");
    expect(host.contents.length).to.be(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).to.be("a/b");
    expect(abFolder.baseName).to.be("a");
    expect(abFolder.contents.length).to.be(2);

    const [cdFolder, abcNode] = abFolder.contents;
    expect(abcNode.name).to.be("c.js");
    expect(abcNode.path).to.be("/example.com/a/b/c.js");
    expect(cdFolder.name).to.be("c/d");

    const [abcdeNode] = cdFolder.contents;
    expect(abcdeNode.name).to.be("e.js");
    expect(abcdeNode.path).to.be("/example.com/a/b/c/d/e.js");
  });

  it("correctly merges in a collapsed source with a shallower level", () => {
    const tree = createNode("root", "", []);
    addToTree(tree, abcSource);
    addToTree(tree, abxSource);

    expect(tree.contents.length).to.be(1);

    const host = tree.contents[0];
    expect(host.name).to.be("example.com");
    expect(host.contents.length).to.be(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).to.be("a/b");
    expect(abFolder.contents.length).to.be(2);

    const [abcNode, abxNode] = abFolder.contents;
    expect(abcNode.name).to.be("c.js");
    expect(abcNode.path).to.be("/example.com/a/b/c.js");
    expect(abxNode.name).to.be("x.js");
    expect(abxNode.path).to.be("/example.com/a/b/x.js");
  });

  it("correctly merges in a collapsed source with the same level", () => {
    const tree = createNode("root", "", []);
    addToTree(tree, abcdeSource);
    addToTree(tree, abcSource);

    expect(tree.contents.length).to.be(1);

    const host = tree.contents[0];
    expect(host.name).to.be("example.com");
    expect(host.contents.length).to.be(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).to.be("a/b");
    expect(abFolder.contents.length).to.be(2);

    const [cdFolder, abcNode] = abFolder.contents;
    expect(abcNode.name).to.be("c.js");
    expect(abcNode.path).to.be("/example.com/a/b/c.js");
    expect(cdFolder.name).to.be("c/d");

    const [abcdeNode] = cdFolder.contents;
    expect(abcdeNode.name).to.be("e.js");
    expect(abcdeNode.path).to.be("/example.com/a/b/c/d/e.js");
  });

  it("can handle duplicate sources with different hashes", () => {
    const tree = createNode("root", "", []);
    addToTree(tree, abcSource);
    addToTree(tree, abcHashSource);
    expect(tree.contents.length).to.be(1);

    const host = tree.contents[0];
    expect(host.name).to.be("example.com");
    expect(host.contents.length).to.be(1);

    const abFolder = host.contents[0];
    expect(abFolder.name).to.be("a/b");
    expect(abFolder.contents.length).to.be(2);

    const [abcNode, abcHashNode] = abFolder.contents;
    expect(abcNode.name).to.be("c.js");
    expect(abcNode.path).to.be("/example.com/a/b/c.js");
    expect(abcHashNode.name).to.be("c.js#d/e?f=g");
    expect(abcHashNode.path).to.be("/example.com/a/b/c.js#d/e?f=g");
  });
});
