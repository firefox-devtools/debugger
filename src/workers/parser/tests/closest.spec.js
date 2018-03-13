/* eslint max-nested-callbacks: ["error", 4]*/

import { getClosestExpression } from "../utils/closest";
import { getSource } from "./helpers";
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
          line: 8,
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
});
