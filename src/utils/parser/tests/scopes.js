/* eslint max-nested-callbacks: ["error", 4]*/

import { getVariablesInLocalScope, getVariablesInScope } from "../scopes";
import { getClosestScope } from "../utils/closest";

import { getSourceText } from "./helpers";

describe("parser", () => {
  describe("getVariablesInLocalScope", () => {
    it("finds scope binding variables", () => {
      const scope = getClosestScope(getSourceText("math"), {
        line: 2,
        column: 2
      });

      var vars = getVariablesInLocalScope(scope);
      expect(vars.map(v => v.name)).toEqual(["n"]);
      expect(vars[0].references[0].node.loc.start).toEqual({
        column: 4,
        line: 3
      });
    });

    it("only gets local variables", () => {
      const scope = getClosestScope(getSourceText("math"), {
        line: 3,
        column: 5
      });

      var vars = getVariablesInLocalScope(scope);

      expect(vars.map(v => v.name)).toEqual(["n"]);
      expect(vars[0].references[0].node.loc.start).toEqual({
        column: 4,
        line: 3
      });
    });

    it("finds variables in block scope", () => {
      const scope = getClosestScope(getSourceText("resolveToken"), {
        line: 34,
        column: 13
      });

      var vars = getVariablesInLocalScope(scope);

      expect(vars.map(v => v.name)).toEqual(["x"]);
    });
  });

  describe("getVariablesInScope", () => {
    it("finds scope binding variables", () => {
      const scope = getClosestScope(getSourceText("math"), {
        line: 3,
        column: 5
      });

      var vars = getVariablesInScope(scope);

      expect(vars).toEqual([
        "this",
        "arguments",
        "n",
        "square",
        "two",
        "four",
        "math",
        "child"
      ]);
    });

    it("finds variables from multiple scopes", () => {
      let vars;
      const source = getSourceText("resolveToken");

      vars = getVariablesInScope(
        getClosestScope(source, {
          line: 36,
          column: 19
        })
      );

      expect(vars).toEqual([
        "this",
        "arguments",
        "y",
        "x",
        "innerScope",
        "outer",
        "fromIIFE",
        "a",
        "b",
        "getA",
        "setB",
        "plusAB",
        "withMultipleScopes"
      ]);

      vars = getVariablesInScope(
        getClosestScope(source, {
          line: 34,
          column: 14
        })
      );

      expect(vars).toEqual([
        "this",
        "arguments",
        "x",
        "innerScope",
        "outer",
        "fromIIFE",
        "a",
        "b",
        "getA",
        "setB",
        "plusAB",
        "withMultipleScopes"
      ]);

      vars = getVariablesInScope(
        getClosestScope(source, {
          line: 24,
          column: 9
        })
      );

      expect(vars).toEqual([
        "this",
        "arguments",
        "inner",
        "innerScope",
        "outer",
        "fromIIFE",
        "a",
        "b",
        "getA",
        "setB",
        "plusAB",
        "withMultipleScopes"
      ]);

      vars = getVariablesInScope(
        getClosestScope(source, {
          line: 28,
          column: 33
        })
      );

      expect(vars).toEqual([
        "this",
        "arguments",
        "toIIFE",
        "innerScope",
        "outer",
        "fromIIFE",
        "a",
        "b",
        "getA",
        "setB",
        "plusAB",
        "withMultipleScopes"
      ]);
    });
  });
});
