/* eslint max-nested-callbacks: ["error", 4]*/

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

      expect(expression.value).toBe("obj.x");
      expect(expression.location.start).toEqual({
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

      expect(expression.value).toBe("beta");
      expect(expression.location.start).toEqual({
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

      expect(node.id).toBe(null);
      expect(node.loc.start).toEqual({
        line: 5,
        column: 8
      });
      expect(node.type).toBe("FunctionExpression");
    });

    it("finds a scope given at the end", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 9,
        column: 1
      });

      const node = scope.block;
      expect(node.id).toBe(null);
      expect(node.loc.start).toEqual({
        line: 7,
        column: 1
      });
      expect(node.type).toBe("FunctionExpression");
    });

    it("Can find the function declaration for square", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 1,
        column: 1
      });

      const node = scope.block;
      expect(node.id.name).toBe("square");
      expect(node.loc.start).toEqual({
        line: 1,
        column: 0
      });
      expect(node.type).toBe("FunctionDeclaration");
    });
  });
});
