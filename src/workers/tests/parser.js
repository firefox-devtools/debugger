const { parse, getFunctions } = require("../parser");

require("./bar");

const func = `
function square(n) {
  return n * n;
}
`;

describe("parser", () => {
  describe("getFunctions", () => {
    it("simple", () => {
      parse({ text: func }, { id: "func" });
      const fncs = getFunctions({ id: "func" });
      expect(fncs).to.equal(false);
    });
  });
});
