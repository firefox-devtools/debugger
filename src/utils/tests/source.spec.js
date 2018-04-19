/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  getFilename,
  getFileURL,
  getMode,
  getSourceLineCount,
  isThirdParty,
  isJavaScript
} from "../source.js";

describe("sources", () => {
  describe("getFilename", () => {
    it("should give us a default of (index)", () => {
      expect(
        getFilename({ url: "http://localhost.com:7999/increment/", id: "" })
      ).toBe("(index)");
    });
    it("should give us the filename", () => {
      expect(
        getFilename({
          url: "http://localhost.com:7999/increment/hello.html",
          id: ""
        })
      ).toBe("hello.html");
    });
    it("should truncate the file name when it is more than 50 chars", () => {
      expect(
        getFileURL({
          url:
            "http://localhost/really-really-really-really-really-really-long-name.html",
          id: ""
        })
      ).toBe("...-really-really-really-really-really-long-name.html");
    });
    it("should give us the filename excluding the query strings", () => {
      expect(
        getFilename({
          url: "http://localhost.com:7999/increment/hello.html?query_strings",
          id: ""
        })
      ).toBe("hello.html");
    });
  });

  describe("getFileURL", () => {
    it("should give us the file url", () => {
      expect(
        getFileURL({
          url: "http://localhost.com:7999/increment/hello.html",
          id: ""
        })
      ).toBe("http://localhost.com:7999/increment/hello.html");
    });
    it("should truncate the file url when it is more than 50 chars", () => {
      expect(
        getFileURL({
          url: "http://localhost-long.com:7999/increment/hello.html",
          id: ""
        })
      ).toBe("...ttp://localhost-long.com:7999/increment/hello.html");
    });
  });

  describe("isJavaScript", () => {
    it("is not JavaScript", () => {
      expect(isJavaScript({ url: "foo.html" })).toBe(false);
      expect(isJavaScript({ contentType: "text/html" })).toBe(false);
    });

    it("is JavaScript", () => {
      expect(isJavaScript({ url: "foo.js" })).toBe(true);
      expect(isJavaScript({ url: "bar.jsm" })).toBe(true);
      expect(isJavaScript({ contentType: "text/javascript" })).toBe(true);
      expect(isJavaScript({ contentType: "application/javascript" })).toBe(
        true
      );
    });
  });

  describe("isThirdParty", () => {
    it("node_modules", () => {
      expect(isThirdParty({ url: "/node_modules/foo.js" })).toBe(true);
    });

    it("bower_components", () => {
      expect(isThirdParty({ url: "/bower_components/foo.js" })).toBe(true);
    });

    it("not third party", () => {
      expect(isThirdParty({ url: "/bar/foo.js" })).toBe(false);
    });
  });

  describe("getMode", () => {
    it("//@flow", () => {
      const source = {
        contentType: "text/javascript",
        text: "// @flow",
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "javascript", typescript: true });
    });

    it("/* @flow */", () => {
      const source = {
        contentType: "text/javascript",
        text: "   /* @flow */",
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "javascript", typescript: true });
    });

    it("mixed html", () => {
      const source = {
        contentType: "",
        text: " <html",
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "htmlmixed" });
    });

    it("elm", () => {
      const source = {
        contentType: "text/x-elm",
        text: 'main = text "Hello, World!"',
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "elm" });
    });

    it("returns jsx if contentType jsx is given", () => {
      const source = {
        contentType: "text/jsx",
        text: "<h1></h1>",
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "jsx" });
    });

    it("returns jsx if sourceMetaData says it's a react component", () => {
      const source = {
        text: "<h1></h1>",
        url: ""
      };
      expect(getMode(source, { hasJsx: true })).toEqual({ name: "jsx" });
    });

    it("returns jsx if the fileExtension is .jsx", () => {
      const source = {
        text: "<h1></h1>",
        url: "myComponent.jsx"
      };
      expect(getMode(source)).toEqual({ name: "jsx" });
    });

    it("typescript", () => {
      const source = {
        contentType: "text/typescript",
        text: "function foo(){}",
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "javascript", typescript: true });
    });

    it("typescript-jsx", () => {
      const source = {
        contentType: "text/typescript-jsx",
        text: "<h1></h1>",
        url: ""
      };

      expect(getMode(source).base.typescript).toBe(true);
    });

    it("clojure", () => {
      const source = {
        contentType: "text/x-clojure",
        text: "(+ 2 3)",
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "clojure" });
    });

    it("coffeescript", () => {
      const source = {
        contentType: "text/coffeescript",
        text: "x = (a) -> 3",
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "coffeescript" });
    });

    it("wasm", () => {
      const source = {
        contentType: "",
        isWasm: true,
        text: {
          binary: "\x00asm\x01\x00\x00\x00"
        },
        url: ""
      };
      expect(getMode(source)).toEqual({ name: "text" });
    });

    it("marko", () => {
      const source = {
        contentType: "does not matter",
        text: "function foo(){}",
        url: "http://localhost.com:7999/increment/sometestfile.marko"
      };
      expect(getMode(source)).toEqual({ name: "javascript" });
    });
  });

  describe("getSourceLineCount", () => {
    it("should give us the amount bytes for wasm source", () => {
      const source = {
        contentType: "",
        isWasm: true,
        text: {
          binary: "\x00asm\x01\x00\x00\x00"
        }
      };
      expect(getSourceLineCount(source)).toEqual(8);
    });

    it("should give us the amout of lines for js source", () => {
      const source = {
        contentType: "text/javascript",
        text: "function foo(){\n}"
      };
      expect(getSourceLineCount(source)).toEqual(2);
    });
  });
});
