const { parse, getFunctions, getPathClosestToLocation } = require("../parser");

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

  describe("getPathClosestToLocation", () => {
    parse({ text: func }, { id: "func" });

    it("Can find the function declaration for square", () => {
      var closestPath = getPathClosestToLocation(
        { id: "func" },
        {
          line: 2,
          column: 1
        }
      );

      expect(closestPath.node.id.name).to.be("square");
      expect(closestPath.node.loc.start).to.equal({
        line: 2,
        column: 10
      });
      expect(closestPath.type).to.be("FunctionDeclaration");
    });

    it("Can find the path at the exact column", () => {
      var closestPath = getPathClosestToLocation(
        { id: "func" },
        {
          line: 2,
          column: 10
        }
      );

      expect(closestPath.node.loc.start).to.equal({
        line: 2,
        column: 10
      });
      expect(closestPath.type).to.be("Identifier");
    });
  });
});
