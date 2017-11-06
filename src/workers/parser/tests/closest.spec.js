/* eslint max-nested-callbacks: ["error", 4]*/

/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getClosestScope, getClosestExpression } from "../utils/closest";

import { getSource } from "./helpers";

describe("parser", () => {
  describe("getClosestExpression", () => {
    describe("member expressions", () => {
      it("Can find a member expression", () => {
        const expression = getClosestExpression(
          getSource("resolveToken"),
          "x",
          {
            line: 15,
            column: 31
          }
        );

        expect(expression).toMatchSnapshot();
      });

      it("find a nested expression", () => {
        const expression = getClosestExpression(
          getSource("expression"),
          "secondProperty",
          {
            line: 2,
            column: 22
          }
        );

        expect(expression).toMatchSnapshot();
      });

      it("finds an expression with a call", () => {
        const expression = getClosestExpression(
          getSource("expression"),
          "secondProperty",
          {
            line: 6,
            column: 32
          }
        );

        expect(expression).toMatchSnapshot();
      });
    });

    it("Can find a local var", () => {
      const expression = getClosestExpression(
        getSource("resolveToken"),
        "beta",
        {
          line: 15,
          column: 21
        }
      );

      expect(expression).toMatchSnapshot();
    });
  });

  describe("getClosestScope", () => {
    it("finds the scope at the beginning", () => {
      const scope = getClosestScope(getSource("func"), {
        line: 5,
        column: 8
      });

      const node = scope.block;
      expect(node).toMatchSnapshot();
    });

    it("finds a scope given at the end", () => {
      const scope = getClosestScope(getSource("func"), {
        line: 9,
        column: 1
      });

      const node = scope.block;
      expect(node).toMatchSnapshot();
    });

    it("Can find the function declaration for square", () => {
      const scope = getClosestScope(getSource("func"), {
        line: 1,
        column: 1
      });

      const node = scope.block;
      expect(node).toMatchSnapshot();
    });
  });
});
