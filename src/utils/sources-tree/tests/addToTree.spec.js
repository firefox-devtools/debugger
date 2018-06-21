/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* eslint max-nested-callbacks: ["error", 4]*/

import { createSource } from "../../../reducers/sources";

import {
  addToTree,
  createDirectoryNode,
  createSourceNode,
  createTree,
  formatTree,
  nodeHasChildren
} from "../index";

type RawSource = {| url: string, id: string |};

function createSourcesMap(sources: RawSource[]) {
  const sourcesMap = sources.reduce((map, source) => {
    map[source.id] = createSource(source);
    return map;
  }, {});

  return sourcesMap;
}

function createSourcesList(sources) {
  return sources.map((s, i) => createSource(s));
}

describe("sources-tree", () => {
  describe("addToTree", () => {
    it("should provide node API", () => {
      const source = createSource({
        url: "http://example.com/a/b/c.js",
        actor: "actor1"
      });

      const root = createDirectoryNode("root", "", [
        createSourceNode("foo", "/foo", source)
      ]);

      expect(root.name).toBe("root");
      expect(nodeHasChildren(root)).toBe(true);
      expect(root.contents).toHaveLength(1);

      const child = root.contents[0];
      expect(child.name).toBe("foo");
      expect(child.path).toBe("/foo");
      expect(child.contents).toBe(source);
      expect(nodeHasChildren(child)).toBe(false);
    });

    it("builds a path-based tree", () => {
      const source1 = createSource({
        url: "http://example.com/foo/source1.js",
        actor: "actor1"
      });
      const tree = createDirectoryNode("root", "", []);

      addToTree(tree, source1, "http://example.com/");
      expect(tree.contents).toHaveLength(1);

      const base = tree.contents[0];
      expect(base.name).toBe("example.com");
      expect(base.contents).toHaveLength(1);

      const fooNode = base.contents[0];
      expect(fooNode.name).toBe("foo");
      expect(fooNode.contents).toHaveLength(1);

      const source1Node = fooNode.contents[0];
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
      const tree = createTree({
        sources: sourceMap,
        debugeeURL: ""
      }).sourceTree;
      // expect(tree.contents).toHaveLength(1);
      const subtree = tree.contents[0];
      expect(subtree.contents).toHaveLength(2);
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("supports data URLs", () => {
      const sources = [
        {
          id: "server1.conn13.child1/39",
          url: "data:text/html,<script>console.log(123)</script>"
        }
      ];

      const sourceMap = createSourcesMap(sources);
      const tree = createTree({
        sources: sourceMap,
        debugeeURL: ""
      }).sourceTree;
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("does not attempt to add two of the same file", () => {
      const sources = [
        {
          id: "server1.conn13.child1/39",
          url: "https://davidwalsh.name/"
        },
        {
          id: "server1.conn13.child1/37",
          url: "https://davidwalsh.name/"
        }
      ];

      const sourceMap = createSourcesMap(sources);
      const tree = createTree({
        sources: sourceMap,
        debugeeURL: ""
      }).sourceTree;
      expect(tree.contents).toHaveLength(1);
      const subtree = tree.contents[0];
      expect(subtree.contents).toHaveLength(1);
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("excludes javascript: URLs from the tree", () => {
      const source1 = createSource({
        url: "javascript:alert('Hello World')",
        actor: "actor1"
      });
      const source2 = createSource({
        url: "http://example.com/source1.js",
        actor: "actor2"
      });
      const source3 = createSource({
        url: "javascript:let i = 10; while (i > 0) i--; console.log(i);",
        actor: "actor3"
      });
      const tree = createDirectoryNode("root", "", []);

      addToTree(tree, source1, "http://example.com/");
      addToTree(tree, source2, "http://example.com/");
      addToTree(tree, source3, "http://example.com/");

      const base = tree.contents[0];
      expect(tree.contents).toHaveLength(1);

      const source1Node = base.contents[0];
      expect(source1Node.name).toBe("source1.js");
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("correctly parses file sources", () => {
      const source = createSource({
        url: "file:///a/b.js",
        actor: "actor1"
      });
      const tree = createDirectoryNode("root", "", []);

      addToTree(tree, source, "file:///a/index.html");
      expect(tree.contents).toHaveLength(1);

      const base = tree.contents[0];
      expect(base.name).toBe("file://");
      expect(base.contents).toHaveLength(1);

      const aNode = base.contents[0];
      expect(aNode.name).toBe("a");
      expect(aNode.contents).toHaveLength(1);

      const bNode = aNode.contents[0];
      expect(bNode.name).toBe("b.js");
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("can add a file to an intermediate directory", () => {
      const testData = [
        {
          id: "server1.conn13.child1/39",
          url: "https://unpkg.com/codemirror@5.1/mode/xml/xml.js"
        },
        {
          id: "server1.conn13.child1/37",
          url: "https://unpkg.com/codemirror@5.1"
        }
      ];

      const sources = createSourcesList(testData);
      const tree = createDirectoryNode("root", "", []);
      sources.forEach(source => addToTree(tree, source, "https://unpkg.com/"));
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
      const tree = createDirectoryNode("root", "", []);
      sources.forEach(source => addToTree(tree, source, "https://unpkg.com/"));
      expect(formatTree(tree)).toMatchSnapshot();
    });

    it("uses debuggeeUrl as default", () => {
      const testData = [
        {
          url: "components/TodoTextInput.js"
        },
        {
          url: "components/Header.js"
        },
        {
          url: "reducers/index.js"
        },
        {
          url: "components/TodoItem.js"
        },
        {
          url: "resource://gre/modules/ExtensionContent.jsm"
        },
        {
          url:
            "https://voz37vlg5.codesandbox.io/static/js/components/TodoItem.js"
        },
        {
          url: "index.js"
        }
      ];

      const domain = "http://localhost:4242";
      const sources = createSourcesList(testData);
      const tree = createDirectoryNode("root", "", []);
      sources.forEach(source => addToTree(tree, source, domain));
      expect(formatTree(tree)).toMatchSnapshot();
    });
  });
});
