/* eslint max-nested-callbacks: ["error", 4]*/

import { getClosestScope, getClosestExpression } from "../utils/closest";
import { getSource, getOriginalSource } from "./helpers";
import { setSource } from "../sources";

describe("parser", () => {
  describe("getClosestExpression", () => {
    describe("member expressions", () => {
      it("Can find a member expression", () => {
        const source = getSource("resolveToken");
        setSource(source);
        const expression = getClosestExpression(source.id, "x", {
          line: 15,
          column: 31
        });

        expect(expression).toMatchSnapshot();
      });

      it("find a nested expression", () => {
        const source = getSource("expression");
        setSource(source);
        const expression = getClosestExpression(
          "expression",
          "secondProperty",
          {
            line: 2,
            column: 22
          }
        );

        expect(expression).toMatchSnapshot();
      });

      it("finds an expression with a call", () => {
        const source = getSource("expression");
        setSource(source);
        const expression = getClosestExpression(source.id, "secondProperty", {
          line: 6,
          column: 32
        });

        expect(expression).toMatchSnapshot();
      });
    });

    it("Can find a local var", () => {
      const source = getSource("resolveToken");
      setSource(source);
      const expression = getClosestExpression(source.id, "beta", {
        line: 15,
        column: 21
      });

      expect(expression).toMatchSnapshot();
    });
  });

  describe("getClosestScope", () => {
    it("finds the scope at the beginning", () => {
      const source = getOriginalSource("func");
      setSource(source);
      const scope = getClosestScope(source.id, {
        line: 5,
        column: 8
      });

      const node = scope.block;
      expect(node).toMatchSnapshot();
    });

    it("finds a scope given at the end", () => {
      const source = getOriginalSource("func");
      setSource(source);
      const scope = getClosestScope(source.id, {
        line: 9,
        column: 1
      });

      const node = scope.block;
      expect(node).toMatchSnapshot();
    });

    it("Can find the function declaration for square", () => {
      const source = getOriginalSource("func");
      setSource(source);
      const scope = getClosestScope(source.id, {
        line: 1,
        column: 1
      });

      const node = scope.block;
      expect(node).toMatchSnapshot();
    });
  });
});
