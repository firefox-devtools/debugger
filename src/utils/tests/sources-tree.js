import { Map } from "immutable";
import {
  createNode,
  nodeHasChildren,
  addToTree,
  collapseTree,
  getDirectories,
  getURL,
  isExactUrlMatch,
  isDirectory
} from "../sources-tree.js";

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
    expect(root.name).toBe("root");
    expect(nodeHasChildren(root)).toBe(true);
    expect(root.contents.length).toBe(1);

    const child = root.contents[0];
    expect(child.name).toBe("foo");
    expect(child.path).toBe("/foo");
    expect(child.contents).toBe(null);
    expect(nodeHasChildren(child)).toBe(false);
  });

  it("builds a path-based tree", () => {
    const source1 = Map({
      url: "http://example.com/foo/source1.js",
      actor: "actor1"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source1);
    expect(tree.contents.length).toBe(1);

    let base = tree.contents[0];
    expect(base.name).toBe("example.com");
    expect(base.contents.length).toBe(1);

    let fooNode = base.contents[0];
    expect(fooNode.name).toBe("foo");
    expect(fooNode.contents.length).toBe(1);

    let source1Node = fooNode.contents[0];
    expect(source1Node.name).toBe("source1.js");
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
    expect(fooNode.name).toBe("foo");
    expect(fooNode.contents.length).toBe(2);

    let source1Node = base.contents[1];
    expect(source1Node.name).toBe("source1.js");

    // source2 should be after source1 alphabetically
    let source2Node = fooNode.contents[1];
    let source3Node = fooNode.contents[0];
    expect(source2Node.name).toBe("b_source2.js");
    expect(source3Node.name).toBe("a_source3.js");
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
      })
    ];

    const tree = createNode("root", "", []);
    sources.forEach(source => addToTree(tree, source));
    const domain = tree.contents[0];

    const [
      bFolderNode,
      b2FileNode,
      dFolderNode,
      aFileNode,
      cFileNode
    ] = domain.contents;

    expect(bFolderNode.name).toBe("b.js");
    expect(bFolderNode.contents.length).toBe(1);
    expect(bFolderNode.contents[0].name).toBe("b_source.js");

    expect(b2FileNode.name).toBe("b2");

    expect(dFolderNode.name).toBe("d");
    expect(dFolderNode.contents.length).toBe(1);
    expect(dFolderNode.contents[0].name).toBe("d_source.js");

    expect(aFileNode.name).toBe("a.js");

    expect(cFileNode.name).toBe("c.js");
  });

  it("puts folder at the top of the sort", () => {
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
        url: "http://example.com/folder/c/",
        actor: "actor1"
      })
    ];

    const tree = createNode("root", "", []);
    sources.forEach(source => addToTree(tree, source));
    const [
      bFolderNode,
      cFolderNode,
      aFileNode
    ] = tree.contents[0].contents[0].contents;

    expect(bFolderNode.name).toBe("b");
    expect(bFolderNode.contents.length).toBe(1);
    expect(bFolderNode.contents[0].name).toBe("b.js");

    expect(cFolderNode.name).toBe("c");
    expect(cFolderNode.contents.length).toBe(1);
    expect(cFolderNode.contents[0].name).toBe("(index)");

    expect(aFileNode.name).toBe("a.js");
  });

  it("puts root debugee url at the top of the sort", () => {
    const sources = [
      Map({
        url: "http://api.example.com/a.js",
        actor: "actor1"
      }),
      Map({
        url: "http://example.com/b.js",
        actor: "actor2"
      }),
      Map({
        url: "http://demo.com/c.js",
        actor: "actor3"
      })
    ];

    const rootA = "http://example.com/path/to/file.html";
    const rootB = "https://www.demo.com/index.html";
    const treeA = createNode("root", "", []);
    const treeB = createNode("root", "", []);
    sources.forEach(source => {
      addToTree(treeA, source, rootA);
      addToTree(treeB, source, rootB);
    });

    expect(treeA.contents[0].contents[0].name).toBe("b.js");
    expect(treeA.contents[1].contents[0].name).toBe("a.js");

    expect(treeB.contents[0].contents[0].name).toBe("c.js");
    expect(treeB.contents[1].contents[0].name).toBe("a.js");
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

    let base = tree.contents[0];
    expect(tree.contents.length).toBe(1);

    let source1Node = base.contents[0];
    expect(source1Node.name).toBe("source1.js");
  });

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
  });

  it("correctly parses webpack sources correctly", () => {
    const source = Map({
      url: "webpack:///a/b.js",
      actor: "actor1"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source);
    expect(tree.contents.length).toBe(1);

    let base = tree.contents[0];
    expect(base.name).toBe("webpack://");
    expect(base.contents.length).toBe(1);

    const aNode = base.contents[0];
    expect(aNode.name).toBe("a");
    expect(aNode.contents.length).toBe(1);

    const bNode = aNode.contents[0];
    expect(bNode.name).toBe("b.js");
  });

  it("correctly parses file sources correctly", () => {
    const source = Map({
      url: "file:///a/b.js",
      actor: "actor1"
    });
    const tree = createNode("root", "", []);

    addToTree(tree, source);
    expect(tree.contents.length).toBe(1);

    let base = tree.contents[0];
    expect(base.name).toBe("file://");
    expect(base.contents.length).toBe(1);

    const aNode = base.contents[0];
    expect(aNode.name).toBe("a");
    expect(aNode.contents.length).toBe(1);

    const bNode = aNode.contents[0];
    expect(bNode.name).toBe("b.js");
  });

  it("gets a source's ancestor directories", function() {
    const source1 = Map({
      url: "http://a/b.js",
      actor: "actor1"
    });

    const source2 = Map({
      url: "http://a/c.js",
      actor: "actor1"
    });

    const source3 = Map({
      url: "http://b/c.js",
      actor: "actor1"
    });

    const tree = createNode("root", "", []);
    addToTree(tree, source1);
    addToTree(tree, source2);
    addToTree(tree, source3);
    const paths = getDirectories("http://a/b.js", tree);

    expect(paths[1].path).toBe("/a");
    expect(paths[0].path).toBe("/a/b.js");
  });

  it("handles '?' in target url", function() {
    const source1 = Map({
      url: "http://a/b.js",
      actor: "actor1"
    });

    const source2 = Map({
      url: "http://b/b.js",
      actor: "actor1"
    });

    const tree = createNode("root", "", []);
    addToTree(tree, source1);
    addToTree(tree, source2);
    const paths = getDirectories("http://a/b.js?key=hi", tree);

    expect(paths[1].path).toBe("/a");
    expect(paths[0].path).toBe("/a/b.js");
  });

  it("handles 'https' in target url", function() {
    const source1 = Map({
      url: "https://a/b.js",
      actor: "actor1"
    });

    const source2 = Map({
      url: "https://b/b.js",
      actor: "actor1"
    });

    const tree = createNode("root", "", []);
    addToTree(tree, source1);
    addToTree(tree, source2);
    const paths = getDirectories("https://a/b.js", tree);

    expect(paths[1].path).toBe("/a");
    expect(paths[0].path).toBe("/a/b.js");
  });

  it("handles normal url with http and https for filename", function() {
    const urlObject = getURL("https://a/b.js");
    const urlObject2 = getURL("http://a/b.js");

    expect(urlObject.filename).toBe("b.js");
    expect(urlObject2.filename).toBe("b.js");
  });

  it("handles url with querystring for filename", function() {
    const urlObject = getURL("https://a/b.js?key=randomeKey");

    expect(urlObject.filename).toBe("b.js");
  });

  it("handles url with '#' for filename", function() {
    const urlObject = getURL("https://a/b.js#specialSection");

    expect(urlObject.filename).toBe("b.js");
  });

  it("handles url with no filename for filename", function() {
    const urlObject = getURL("https://a/c");

    expect(urlObject.filename).toBe("(index)");
  });

  it("recognizes root url match", () => {
    const rootA = "http://example.com/path/to/file.html";
    const rootB = "https://www.demo.com/index.html";

    expect(isExactUrlMatch("example.com", rootA)).toBe(true);
    expect(isExactUrlMatch("www.example.com", rootA)).toBe(true);
    expect(isExactUrlMatch("api.example.com", rootA)).toBe(false);
    expect(isExactUrlMatch("example.example.com", rootA)).toBe(false);
    expect(isExactUrlMatch("www.example.example.com", rootA)).toBe(false);
    expect(isExactUrlMatch("demo.com", rootA)).toBe(false);

    expect(isExactUrlMatch("demo.com", rootB)).toBe(true);
    expect(isExactUrlMatch("www.demo.com", rootB)).toBe(true);
    expect(isExactUrlMatch("maps.demo.com", rootB)).toBe(false);
    expect(isExactUrlMatch("demo.demo.com", rootB)).toBe(false);
    expect(isExactUrlMatch("www.demo.demo.com", rootB)).toBe(false);
    expect(isExactUrlMatch("example.com", rootB)).toBe(false);
  });

  it("identifies directories correctly", () => {
    const sources = [
      Map({
        url: "http://example.com/a.js",
        actor: "actor1"
      }),
      Map({
        url: "http://example.com/b/c/d.js",
        actor: "actor2"
      })
    ];

    const tree = createNode("root", "", []);
    sources.forEach(source => addToTree(tree, source));
    const [bFolderNode, aFileNode] = tree.contents[0].contents;
    const [cFolderNode] = bFolderNode.contents;
    const [dFileNode] = cFolderNode.contents;

    expect(isDirectory(bFolderNode)).toBe(true);
    expect(isDirectory(aFileNode)).toBe(false);
    expect(isDirectory(cFolderNode)).toBe(true);
    expect(isDirectory(dFileNode)).toBe(false);
  });
});
