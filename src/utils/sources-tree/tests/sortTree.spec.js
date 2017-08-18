/* eslint max-nested-callbacks: ["error", 4]*/

import { Map } from "immutable";

import { addToTree, sortEntireTree, createNode, formatTree } from "../index";

describe("sources-tree", () => {
  describe("sortEntireTree", () => {
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
      const _tree = createNode("root", "", []);

      addToTree(_tree, source1);
      addToTree(_tree, source2);
      addToTree(_tree, source3);
      const tree = sortEntireTree(_tree);

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

      const _tree = createNode("root", "", []);
      sources.forEach(source => addToTree(_tree, source));
      const tree = sortEntireTree(_tree);
      const domain = tree.contents[0];

      const [
        indexNode,
        bFolderNode,
        dFolderNode,
        aFileNode,
        b2FileNode,
        cFileNode
      ] = domain.contents;

      expect(formatTree(tree)).toMatchSnapshot();
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

      const _tree = createNode("root", "", []);
      sources.forEach(source => addToTree(_tree, source));
      const tree = sortEntireTree(_tree);
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
      const _treeA = createNode("root", "", []);
      const _treeB = createNode("root", "", []);
      sources.forEach(source => {
        addToTree(_treeA, source, rootA);
        addToTree(_treeB, source, rootB);
      });
      const treeA = sortEntireTree(_treeA, rootA);
      const treeB = sortEntireTree(_treeB, rootB);

      expect(treeA.contents[0].contents[0].name).toBe("b.js");
      expect(treeA.contents[1].contents[0].name).toBe("a.js");

      expect(treeB.contents[0].contents[0].name).toBe("c.js");
      expect(treeB.contents[1].contents[0].name).toBe("a.js");
      expect(formatTree(treeA)).toMatchSnapshot();
      expect(formatTree(treeB)).toMatchSnapshot();
    });
  });
});
