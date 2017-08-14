import { getFilename, getMode, getSourceLineCount } from "../source.js";

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
  });

  describe("getMode", () => {
    it("//@flow", () => {
      const source = {
        contentType: "text/javascript",
        text: "// @flow"
      };
      expect(getMode(source).typescript).toBe(true);
    });

    it("/* @flow */", () => {
      const source = {
        contentType: "text/javascript",
        text: "   /* @flow */"
      };
      expect(getMode(source).typescript).toBe(true);
    });

    it("mixed html", () => {
      const source = {
        contentType: "",
        text: " <html"
      };
      expect(getMode(source)).toEqual({ name: "htmlmixed" });
    });

    it("elm", () => {
      const source = {
        contentType: "text/x-elm",
        text: 'main = text "Hello, World!"'
      };
      expect(getMode(source)).toBe("elm");
    });

    it("jsx", () => {
      const source = {
        contentType: "text/jsx",
        text: "<h1></h1>"
      };
      expect(getMode(source)).toBe("jsx");
    });

    it("typescript", () => {
      const source = {
        contentType: "text/typescript",
        text: "function foo(){}"
      };
      expect(getMode(source).typescript).toBe(true);
    });

    it("typescript-jsx", () => {
      const source = {
        contentType: "text/typescript-jsx",
        text: "<h1></h1>"
      };
      expect(getMode(source).base.typescript).toBe(true);
    });

    it("clojure", () => {
      const source = {
        contentType: "text/x-clojure",
        text: "(+ 2 3)"
      };
      expect(getMode(source)).toBe("clojure");
    });

    it("coffeescript", () => {
      const source = {
        contentType: "text/coffeescript",
        text: "x = (a) -> 3"
      };
      expect(getMode(source)).toBe("coffeescript");
    });

    it("wasm", () => {
      const source = {
        contentType: "",
        isWasm: true,
        text: {
          binary: "\x00asm\x01\x00\x00\x00"
        }
      };
      expect(getMode(source)).toEqual({ name: "text" });
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
