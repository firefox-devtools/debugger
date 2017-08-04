/* eslint max-nested-callbacks: ["error", 4]*/

import { Map } from "immutable";

import {
  addToTree,
  createNode,
  nodeHasChildren,
  createTree,
  formatTree
} from "../index";

function createSourcesMap(sources) {
  const msources = sources.map((s, i) => new Map(s));
  let sourcesMap = Map();
  msources.forEach(s => {
    sourcesMap = sourcesMap.mergeIn([s.get("id")], s);
  });

  return sourcesMap;
}

function createSourcesList(sources) {
  return sources.map((s, i) => new Map(s));
}

describe("sources-tree", () => {
  describe("addToTree", () => {
    it("should provide node API", () => {
      const source = Map({
        url: "http://example.com/a/b/c.js",
        actor: "actor1"
      });

      const root = createNode("root", "", [createNode("foo", "/foo", source)]);
      expect(root.name).toBe("root");
      expect(nodeHasChildren(root)).toBe(true);
      expect(root.contents.length).toBe(1);

      const child = root.contents[0];
      expect(child.name).toBe("foo");
      expect(child.path).toBe("/foo");
      expect(child.contents).toBe(source);
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

    it("does not attempt to add two of the same directory", () => {
      const sources = [
        {
          id: "server1.conn13.child1/39",
          url: "https://davidwalsh.name/wp-content/prism.js"
        },
        {
          id: "server1.conn13.child1/37",
          url: "https://davidwalsh.name/"
        }
      ];

      const sourceMap = createSourcesMap(sources);
      const tree = createTree(sourceMap, "").sourceTree;
      expect(tree.contents.length).toBe(1);
      const subtree = tree.contents[0];
      expect(subtree.contents.length).toBe(2);
      expect(formatTree(tree)).toMatchSnapshot();
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
      expect(formatTree(tree)).toMatchSnapshot();
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
        indexNode,
        bFolderNode,
        b2FileNode,
        dFolderNode,
        aFileNode,
        cFileNode
      ] = domain.contents;

      expect(indexNode.name).toBe("(index)");
      expect(bFolderNode.name).toBe("b.js");
      expect(bFolderNode.contents.length).toBe(1);
      expect(bFolderNode.contents[0].name).toBe("b_source.js");

      expect(b2FileNode.name).toBe("b2");

      expect(dFolderNode.name).toBe("d");
      expect(dFolderNode.contents.length).toBe(1);
      expect(dFolderNode.contents[0].name).toBe("d_source.js");

      expect(aFileNode.name).toBe("a.js");

      expect(cFileNode.name).toBe("c.js");
      expect(formatTree(tree)).toMatchSnapshot();
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
      expect(formatTree(tree)).toMatchSnapshot();
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
      expect(formatTree(treeA)).toMatchSnapshot();
      expect(formatTree(treeB)).toMatchSnapshot();
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
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("correctly parses file sources", () => {
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
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("can add a file to an intermediate directory", () => {
      const testData = [
        {
          id: "server1.conn13.child1/39",
          url: "https://unpkg.com/codemirror/mode/xml/xml.js"
        },
        {
          id: "server1.conn13.child1/37",
          url: "https://unpkg.com/codemirror"
        }
      ];

      const sources = createSourcesList(testData);
      const tree = createNode("root", "", []);
      sources.forEach(source => addToTree(tree, source));
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("replaces a file with a directory", () => {
      const testData = [
        {
          id: "server1.conn13.child1/37",
          url: "https://unpkg.com/codemirror@5.1"
        },

        {
          id: "server1.conn13.child1/39",
          url: "https://unpkg.com/codemirror@5.1/mode/xml/xml.js"
        }
      ];

      const sources = createSourcesList(testData);
      const tree = createNode("root", "", []);
      sources.forEach(source => addToTree(tree, source));

      expect(formatTree(tree)).toMatchSnapshot();
    });
  });
});
