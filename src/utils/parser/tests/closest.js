const expect = require("expect.js");
import { getClosestScope, getClosestExpression } from "../utils/closest";

import { getSourceText } from "./helpers";

describe("parser", () => {
  describe("getClosestExpression", () => {
    it("Can find a member expression", () => {
      const expression = getClosestExpression(
        getSourceText("resolveToken"),
        "x",
        {
          line: 15,
          column: 31
        }
      );

      expect(expression.value).to.be("obj.x");
      expect(expression.location.start).to.eql({
        line: 15,
        column: 26
      });
    });

    it("Can find a local var", () => {
      const expression = getClosestExpression(
        getSourceText("resolveToken"),
        "beta",
        {
          line: 15,
          column: 21
        }
      );

      expect(expression.value).to.be("beta");
      expect(expression.location.start).to.eql({
        line: 15,
        column: 19
      });
    });
  });

  describe("getClosestScope", () => {
    it("finds the scope at the beginning", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 5,
        column: 8
      });

      const node = scope.block;

      expect(node.id).to.be(null);
      expect(node.loc.start).to.eql({
        line: 5,
        column: 8
      });
      expect(node.type).to.be("FunctionExpression");
    });

    it("finds a scope given at the end", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 9,
        column: 1
      });

      const node = scope.block;
      expect(node.id).to.be(null);
      expect(node.loc.start).to.eql({
        line: 7,
        column: 1
      });
      expect(node.type).to.be("FunctionExpression");
    });

    it("Can find the function declaration for square", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 1,
        column: 1
      });

      const node = scope.block;
      expect(node.id.name).to.be("square");
      expect(node.loc.start).to.eql({
        line: 1,
        column: 0
      });
      expect(node.type).to.be("FunctionDeclaration");
    });
  });
});
