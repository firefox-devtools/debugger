const expect = require("expect.js");
const { Map } = require("immutable");
const {
  createNode, nodeHasChildren, addToTree, collapseTree
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

  it("sorts folders first", () => {
    const sources = [
      Map({
        url: "http://example.com/a.js",
        actor: "actor1"
      }),
      Map({
        url: "http://example.com/b.js/b_source.js",
        actor: "actor2"
      }),
      Map({
        url: "http://example.com/c.js",
        actor: "actor1"
      }),
      Map({
        url: "http://example.com",
        actor: "actor1"
      }),
      Map({
        url: "http://example.com/d/d_source.js",
        actor: "actor3"
      }),
      Map({
        url: "http://example.com/b2",
        actor: "actor2"
      }),
    ];

    const tree = createNode("root", "", []);
    sources.forEach(source => addToTree(tree, source));
    const domain = tree.contents[0];

    const [
      bFolderNode,
      b2FolderNode,
      dFolderNode,
      aFileNode,
      cFileNode,
    ] = domain.contents;

    expect(bFolderNode.name).to.be("b.js");
    expect(bFolderNode.contents.length).to.be(1);
    expect(bFolderNode.contents[0].name).to.be("b_source.js");

    expect(b2FolderNode.name).to.be("b2");
    expect(b2FolderNode.contents.length).to.be(1);
    expect(b2FolderNode.contents[0].name).to.be("(index)");

    expect(dFolderNode.name).to.be("d");
    expect(dFolderNode.contents.length).to.be(1);
    expect(dFolderNode.contents[0].name).to.be("d_source.js");

    expect(aFileNode.name).to.be("a.js");

    expect(cFileNode.name).to.be("c.js");
  });

  it("puts (index) at the top of the sort", () => {
    const sources = [
      Map({
        url: "http://example.com/folder/a.js",
        actor: "actor1"
      }),
      Map({
        url: "http://example.com/folder/b/b.js",
        actor: "actor2"
      }),
      Map({
        url: "http://example.com/folder",
        actor: "actor1"
      }),
      Map({
        url: "http://example.com/folder/c/",
        actor: "actor1"
      }),
    ];

    const tree = createNode("root", "", []);
    sources.forEach(source => addToTree(tree, source));
    const [
      indexNode,
      bFolderNode,
      cFolderNode,
      aFileNode,
    ] = tree.contents[0].contents[0].contents;

    expect(indexNode.name).to.be("(index)");

    expect(bFolderNode.name).to.be("b");
    expect(bFolderNode.contents.length).to.be(1);
    expect(bFolderNode.contents[0].name).to.be("b.js");

    expect(cFolderNode.name).to.be("c");
    expect(cFolderNode.contents.length).to.be(1);
    expect(cFolderNode.contents[0].name).to.be("(index)");

    expect(aFileNode.name).to.be("a.js");
  });

  it("excludes javascript: URLs from the tree", () => {
    const source1 = Map({
      url: "javascript:alert('Hello World')",
      actor: "actor1"
    });
    const source2 = Map({
      url: "http://example.com/source1.js",
      actor: "actor2"
    });
    const source3 = Map({
      url: "javascript:let i = 10; while (i > 0) i--; console.log(i);",
      actor: "actor3"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source1);
    addToTree(tree, source2);
    addToTree(tree, source3);
    console.log(tree.contents[0]);
    console.log(tree.contents[1]);
    let base = tree.contents[0];
    expect(tree.contents.length).to.be(1);

    let source1Node = base.contents[0];
    expect(source1Node.name).to.be("source1.js");
  });

  it("can collapse a single source", () => {
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcSource);
    expect(fullTree.contents.length).to.be(1);
    const tree = collapseTree(fullTree);

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
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcSource);
    addToTree(fullTree, abcdeSource);
    const tree = collapseTree(fullTree);

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

  it("correctly merges in a collapsed source with a shallower level", () => {
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcSource);
    addToTree(fullTree, abxSource);
    const tree = collapseTree(fullTree);

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
    const fullTree = createNode("root", "", []);
    addToTree(fullTree, abcdeSource);
    addToTree(fullTree, abcSource);
    const tree = collapseTree(fullTree);

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

  it("correctly parses webpack sources correctly", () => {
    const source = Map({
      url: "webpack:///a/b.js",
      actor: "actor1"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source);
    expect(tree.contents.length).to.be(1);

    let base = tree.contents[0];
    expect(base.name).to.be("webpack://");
    expect(base.contents.length).to.be(1);

    const aNode = base.contents[0];
    expect(aNode.name).to.be("a");
    expect(aNode.contents.length).to.be(1);

    const bNode = aNode.contents[0];
    expect(bNode.name).to.be("b.js");
  });

  it("correctly parses file sources correctly", () => {
    const source = Map({
      url: "file:///a/b.js",
      actor: "actor1"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source);
    expect(tree.contents.length).to.be(1);

    let base = tree.contents[0];
    expect(base.name).to.be("file://");
    expect(base.contents.length).to.be(1);

    const aNode = base.contents[0];
    expect(aNode.name).to.be("a");
    expect(aNode.contents.length).to.be(1);

    const bNode = aNode.contents[0];
    expect(bNode.name).to.be("b.js");
  });
});
