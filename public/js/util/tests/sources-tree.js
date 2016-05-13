"use strict";

const expect = require("expect.js");
const { Map } = require("immutable");
const {
  createNode, nodeHasChildren, addToTree
} = require("../sources-tree.js");

describe("sources-tree", () => {
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
});
