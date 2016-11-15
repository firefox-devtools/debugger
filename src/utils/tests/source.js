const expect = require("expect.js");
const {
  getFilename
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
});
