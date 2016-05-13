"use strict";

const expect = require("expect.js");
const { Map } = require("immutable");
const {
  createNode, nodeHasChildren, nodeName,
  nodeContents, nodePath, addToTree
} = require("../util/sources-tree.js");

describe("sources-tree", () => {
  it("should provide node API", () => {
    const root = createNode("root", "", [createNode("foo", "/foo")]);
    expect(nodeName(root)).to.be("root");
    expect(nodeHasChildren(root)).to.be(true);
    expect(nodeContents(root).length).to.be(1);

    const child = nodeContents(root)[0];
    expect(nodeName(child)).to.be("foo");
    expect(nodePath(child)).to.be("/foo");
    expect(nodeContents(child)).to.be(null);
    expect(nodeHasChildren(child)).to.be(false);
  });

  it("builds a path-based tree", () => {
    const source1 = Map({
      url: "http://example.com/foo/source1.js",
      actor: "actor1"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source1);
    expect(nodeContents(tree).length).to.be(1);

    let base = nodeContents(tree)[0];
    expect(nodeName(base)).to.be("example.com");
    expect(nodeContents(base).length).to.be(1);

    let fooNode = nodeContents(base)[0];
    expect(nodeName(fooNode)).to.be("foo");
    expect(nodeContents(fooNode).length).to.be(1);

    let source1Node = nodeContents(fooNode)[0];
    expect(nodeName(source1Node)).to.be("source1.js");
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

    let base = nodeContents(tree)[0];
    let fooNode = nodeContents(base)[0];
    expect(nodeName(fooNode)).to.be("foo");
    expect(nodeContents(fooNode).length).to.be(2);

    let source1Node = nodeContents(base)[1];
    expect(nodeName(source1Node)).to.be("source1.js");

    // source2 should be after source1 alphabetically
    let source2Node = nodeContents(fooNode)[1];
    let source3Node = nodeContents(fooNode)[0];
    expect(nodeName(source2Node)).to.be("b_source2.js");
    expect(nodeName(source3Node)).to.be("a_source3.js");
  });
});
