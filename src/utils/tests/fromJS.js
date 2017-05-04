const expect = require("expect.js");
const fromJS = require("../fromJS");

const preview = {
  kind: "ArrayLike",
  length: 201,
  items: [
    {
      type: "null"
    },
    "a test",
    "a",
    {
      type: "null"
    },
    {
      type: "null"
    },
    {
      type: "null"
    },
    {
      type: "null"
    },
    {
      type: "null"
    },
    {
      type: "null"
    },
    {
      type: "null"
    }
  ]
};

describe("fromJS", () => {
  it("supports array like objects", () => {
    const iPreview = fromJS(preview);
    expect(iPreview.get("length")).to.equal(201);
    expect(iPreview.get("items").size).to.equal(10);
  });

  it("supports arrays", () => {
    const iItems = fromJS(preview.items);
    expect(iItems.getIn([0, "type"])).to.equal("null");
    expect(iItems.size).to.equal(10);
  });

  it("supports objects without a prototype", () => {
    expect(() => fromJS(Object.create(null))).to.not.throwException();
  });
});
