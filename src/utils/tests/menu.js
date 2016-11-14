const expect = require("expect.js");
const { buildMenu } = require("../menu.js");

describe("menu", () => {
  it("should return an array of visible menu items", () => {
    let menuItems = [
      { item: "bla", hidden: false },
      { item: "foo", hidden: true },
      { item: "baa", hidden: () => true },
      { item: "foobar" }
    ];
    expect(buildMenu(menuItems)[1]).to.be("foobar");
  });
});
