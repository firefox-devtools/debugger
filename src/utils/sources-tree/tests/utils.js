/* eslint max-nested-callbacks: ["error", 4]*/

import { Map } from "immutable";

import {
  createNode,
  getRelativePath,
  isExactUrlMatch,
  isDirectory,
  addToTree,
  getURL,
  getDirectories
} from "../index";

describe("sources tree", () => {
  describe("isExactUrlMatch", () => {
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
  });

  describe("isDirectory", () => {
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

  describe("getRelativePath", () => {
    it("gets the relative path of the file", () => {
      const relPath = "path/to/file.html";
      expect(getRelativePath("http://example.com/path/to/file.html")).toBe(
        relPath
      );
      expect(getRelativePath("http://www.example.com/path/to/file.html")).toBe(
        relPath
      );
      expect(getRelativePath("https://example.com/path/to/file.html")).toBe(
        relPath
      );
    });
  });

  describe("getDirectories", () => {
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
  });

  describe("getUrl", () => {
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
  });
});
