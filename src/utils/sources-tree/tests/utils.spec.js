/* eslint max-nested-callbacks: ["error", 4]*/
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

//import { Map } from "immutable";
import { createSourceRecord } from "../../../reducers/sources";

import {
  createNode,
  getRelativePath,
  isExactUrlMatch,
  isDirectory,
  addToTree,
  sortEntireTree,
  getURL,
  getDirectories,
  isNotJavaScript
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
        createSourceRecord({
          url: "http://example.com/a.js",
          actor: "actor1"
        }),
        createSourceRecord({
          url: "http://example.com/b/c/d.js",
          actor: "actor2"
        })
      ];

      const tree = createNode("root", "", []);
      sources.forEach(source => addToTree(tree, source, "http://example.com/"));
      sortEntireTree(tree);
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
      expect(getRelativePath("https://www.example.com/path/to/file.js")).toBe(
        "path/to/file.js"
      );
      expect(getRelativePath("webpack:///path/to/file.html")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file.html")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file.html?bla")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file.html#bla")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file")).toBe("path/to/file");
    });
  });

  describe("getDirectories", () => {
    it("gets a source's ancestor directories", function() {
      const source1 = createSourceRecord({
        url: "http://a/b.js",
        actor: "actor1"
      });

      const source2 = createSourceRecord({
        url: "http://a/c.js",
        actor: "actor1"
      });

      const source3 = createSourceRecord({
        url: "http://b/c.js",
        actor: "actor1"
      });

      const tree = createNode("root", "", []);
      addToTree(tree, source1, "http://a/");
      addToTree(tree, source2, "http://a/");
      addToTree(tree, source3, "http://a/");
      const paths = getDirectories("http://a/b.js", tree);

      expect(paths[1].path).toBe("a");
      expect(paths[0].path).toBe("a/b.js");
    });

    it("handles '?' in target url", function() {
      const source1 = createSourceRecord({
        url: "http://a/b.js",
        actor: "actor1"
      });

      const source2 = createSourceRecord({
        url: "http://b/b.js",
        actor: "actor1"
      });

      const tree = createNode("root", "", []);
      addToTree(tree, source1, "http://a/");
      addToTree(tree, source2, "http://a/");
      const paths = getDirectories("http://a/b.js?key=hi", tree);

      expect(paths[1].path).toBe("a");
      expect(paths[0].path).toBe("a/b.js");
    });

    it("handles 'https' in target url", function() {
      const source1 = createSourceRecord({
        url: "https://a/b.js",
        actor: "actor1"
      });

      const source2 = createSourceRecord({
        url: "https://b/b.js",
        actor: "actor1"
      });

      const tree = createNode("root", "", []);
      addToTree(tree, source1, "http://a/");
      addToTree(tree, source2, "http://a/");
      const paths = getDirectories("https://a/b.js", tree);

      expect(paths[1].path).toBe("a");
      expect(paths[0].path).toBe("a/b.js");
    });
  });

  describe("getUrl", () => {
    it("handles normal url with http and https for filename", function() {
      const urlObject = getURL("https://a/b.js");
      expect(urlObject.filename).toBe("b.js");

      const urlObject2 = getURL("http://a/b.js");
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

  describe("isNotJavaScript", () => {
    it("js file", () => {
      const source = { url: "http://example.com/foo.js" };
      expect(isNotJavaScript(source)).toBe(false);
    });

    it("css file", () => {
      const source = { url: "http://example.com/foo.css" };
      expect(isNotJavaScript(source)).toBe(true);
    });

    it("svg file", () => {
      const source = { url: "http://example.com/foo.svg" };
      expect(isNotJavaScript(source)).toBe(true);
    });

    it("png file", () => {
      const source = { url: "http://example.com/foo.png" };
      expect(isNotJavaScript(source)).toBe(true);
    });
  });
});
