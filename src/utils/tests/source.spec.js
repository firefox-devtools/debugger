import {
  getFilename,
  getMode,
  getSourceLineCount,
  isThirdParty
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
      expect(getMode(source).typescript).toBe(true);
    });

    it("/* @flow */", () => {
      const source = {
        contentType: "text/javascript",
        text: "   /* @flow */",
        url: ""
      };
      expect(getMode(source).typescript).toBe(true);
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
      expect(getMode(source)).toBe("elm");
    });

    it("jsx", () => {
      const source = {
        contentType: "text/jsx",
        text: "<h1></h1>",
        url: ""
      };
      expect(getMode(source)).toBe("jsx");
    });

    it("typescript", () => {
      const source = {
        contentType: "text/typescript",
        text: "function foo(){}",
        url: ""
      };
      expect(getMode(source).typescript).toBe(true);
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
      expect(getMode(source)).toBe("clojure");
    });

    it("coffeescript", () => {
      const source = {
        contentType: "text/coffeescript",
        text: "x = (a) -> 3",
        url: ""
      };
      expect(getMode(source)).toBe("coffeescript");
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
