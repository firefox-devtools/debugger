const expect = require("expect.js");
const {
  getFilename, getMode
} = require("../source.js");

describe("sources", () => {
  describe("getFilename", () => {
    it("should give us a default of (index)", () => {
      expect(getFilename({ url: "http://localhost.com:7999/increment/", id: "" })).to.be("(index)");
    });
    it("should give us the filename", () => {
      expect(getFilename({ url: "http://localhost.com:7999/increment/hello.html", id: "" })).to.be("hello.html");
    });
  });

  describe("getMode", () => {
    it("//@flow", () => {
      const sourceText = {
        contentType: "text/javascript",
        text: "// @flow"
      };
      expect(getMode(sourceText).typescript).to.be(true);
    });

    it("/* @flow */", () => {
      const sourceText = {
        contentType: "text/javascript",
        text: "   /* @flow */"
      };
      expect(getMode(sourceText).typescript).to.be(true);
    });

    it("mixed html", () => {
      const sourceText = {
        contentType: "",
        text: " <html"
      };
      expect(getMode(sourceText)).to.eql({ name: "htmlmixed" });
    });

    it("elm", () => {
      const sourceText = {
        contentType: "text/x-elm",
        text: ""
      };
      expect(getMode(sourceText)).to.be("elm");
    });

    it("jsx", () => {
      const sourceText = {
        contentType: "text/jsx",
        text: ""
      };
      expect(getMode(sourceText)).to.be("jsx");
    });

    it("typescript", () => {
      const sourceText = {
        contentType: "text/typescript",
        text: ""
      };
      expect(getMode(sourceText).typescript).to.be(true);
    });

    it("typescript-jsx", () => {
      const sourceText = {
        contentType: "text/typescript-jsx",
        text: ""
      };
      expect(getMode(sourceText).base.typescript).to.be(true);
    });

    it("clojure", () => {
      const sourceText = {
        contentType: "text/x-clojure",
        text: ""
      };
      expect(getMode(sourceText)).to.be("clojure");
    });

    it("coffeescript", () => {
      const sourceText = {
        contentType: "text/coffeescript",
        text: ""
      };
      expect(getMode(sourceText)).to.be("coffeescript");
    });
  });
});
