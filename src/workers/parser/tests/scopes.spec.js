/* eslint max-nested-callbacks: ["error", 4]*/

import { getVariablesInLocalScope, getVariablesInScope } from "../scopes";
import { getClosestScope } from "../utils/closest";
import { setSource } from "../sources";

import { getSource } from "./helpers";

describe("scopes", () => {
  describe("getVariablesInLocalScope", () => {
    it("finds scope binding variables", () => {
      const source = getSource("math");
      setSource(source);
      const scope = getClosestScope(source.id, {
        line: 2,
        column: 2
      });

      const vars = getVariablesInLocalScope(scope);
      expect(vars.map(v => v.name)).toEqual(["n"]);
      expect(vars[0].references[0].node.loc.start).toEqual({
        column: 4,
        line: 4
      });
    });

    it("only gets local variables", () => {
      const source = getSource("math");
      setSource(source);
      const scope = getClosestScope(source.id, {
        line: 3,
        column: 5
      });

      const vars = getVariablesInLocalScope(scope);

      expect(vars.map(v => v.name)).toEqual(["n"]);
      expect(vars[0].references[0].node.loc.start).toEqual({
        column: 4,
        line: 4
      });
    });

    it("finds variables in block scope", () => {
      const source = getSource("resolveToken");
      setSource(source);
      const scope = getClosestScope(source.id, {
        line: 34,
        column: 13
      });

      const vars = getVariablesInLocalScope(scope);

      expect(vars.map(v => v.name)).toEqual(["x"]);
    });
  });

  describe("getVariablesInScope", () => {
    it("finds scope binding variables", () => {
      const source = getSource("math");
      setSource(source);

      expect(
        getVariablesInScope(
          getClosestScope(source.id, {
            line: 3,
            column: 5
          })
        )
      ).toMatchSnapshot();
    });

    it("finds variables from multiple scopes", () => {
      const source = getSource("resolveToken");
      setSource(source);

      const locations = [
        { line: 36, column: 19 },
        { line: 34, column: 14 },
        { line: 24, column: 9 },
        { line: 28, column: 33 }
      ];

      locations.forEach(location =>
        expect(
          getVariablesInScope(getClosestScope(source.id, location))
        ).toMatchSnapshot()
      );
    });
  });
});
