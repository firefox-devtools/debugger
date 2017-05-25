const { getFilename, getMode } = require("../source.js");

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
      const sourceText = {
        contentType: "text/javascript",
        text: "// @flow"
      };
      expect(getMode(sourceText).typescript).toBe(true);
    });

    it("/* @flow */", () => {
      const sourceText = {
        contentType: "text/javascript",
        text: "   /* @flow */"
      };
      expect(getMode(sourceText).typescript).toBe(true);
    });

    it("mixed html", () => {
      const sourceText = {
        contentType: "",
        text: " <html"
      };
      expect(getMode(sourceText)).toEqual({ name: "htmlmixed" });
    });

    it("elm", () => {
      const sourceText = {
        contentType: "text/x-elm",
        text: ""
      };
      expect(getMode(sourceText)).toBe("elm");
    });

    it("jsx", () => {
      const sourceText = {
        contentType: "text/jsx",
        text: ""
      };
      expect(getMode(sourceText)).toBe("jsx");
    });

    it("typescript", () => {
      const sourceText = {
        contentType: "text/typescript",
        text: ""
      };
      expect(getMode(sourceText).typescript).toBe(true);
    });

    it("typescript-jsx", () => {
      const sourceText = {
        contentType: "text/typescript-jsx",
        text: ""
      };
      expect(getMode(sourceText).base.typescript).toBe(true);
    });

    it("clojure", () => {
      const sourceText = {
        contentType: "text/x-clojure",
        text: ""
      };
      expect(getMode(sourceText)).toBe("clojure");
    });

    it("coffeescript", () => {
      const sourceText = {
        contentType: "text/coffeescript",
        text: ""
      };
      expect(getMode(sourceText)).toBe("coffeescript");
    });
  });
});
