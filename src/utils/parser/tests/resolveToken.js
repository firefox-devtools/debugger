const expect = require("expect.js");
import resolveToken from "../resolveToken";
import { getClosestScope } from "../utils/closest";

import { getSourceText } from "./helpers";

describe("parser", () => {
  describe("resolveToken", () => {
    it("should get the expression for the token at location", () => {
      const { expression, inScope } = resolveToken(
        getSourceText("expression"),
        "b",
        {
          line: 5,
          column: 16
        },
        {
          location: {
            line: 1,
            column: 18
          }
        }
      );

      expect(inScope).to.be(true);
      expect(expression.value).to.be("obj.a.b");
      expect(expression.location.start).to.eql({
        line: 5,
        column: 9
      });
    });

    it("should not find any expression", () => {
      const { expression, inScope } = resolveToken(
        getSourceText("expression"),
        "d",
        {
          line: 6,
          column: 14
        },
        {
          location: {
            line: 1,
            column: 18
          }
        }
      );

      expect(expression).to.be(null);
      expect(inScope).to.be(false);
    });

    it("should not find the expression at a wrong location", () => {
      const { expression, inScope } = resolveToken(
        getSourceText("expression"),
        "b",
        {
          line: 6,
          column: 0
        },
        {
          location: {
            line: 1,
            column: 18
          }
        }
      );

      expect(expression).to.be(null);
      expect(inScope).to.be(false);
    });

    it("should get the expression with 'this'", () => {
      const { expression } = resolveToken(
        getSourceText("thisExpression"),
        "a",
        { line: 9, column: 25 },
        {
          location: {
            line: 2,
            column: 1
          }
        }
      );

      expect(expression.value).to.be("this.foo.a");
      expect(expression.location.start).to.eql({
        line: 9,
        column: 16
      });
    });

    it("should get 'this' expression", () => {
      const { expression } = resolveToken(
        getSourceText("thisExpression"),
        "this",
        { line: 3, column: 5 },
        {
          location: {
            line: 2,
            column: 18
          }
        }
      );

      expect(expression.value).to.be("this");
      expect(expression.location.start).to.eql({
        line: 3,
        column: 4
      });
    });

    it("should report in scope when in the same function as frame", () => {
      const frame = {
        location: {
          line: 9,
          column: 7
        }
      };
      const location = {
        line: 8,
        column: 11
      };

      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "newB",
        location,
        frame
      );

      expect(inScope).to.be(true);
    });

    it("should report out of scope when in a different function", () => {
      const location = {
        line: 5,
        column: 7
      };

      // on return a;
      const frame = {
        location: {
          line: 8,
          column: 11
        }
      };
      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "newB",
        location,
        frame
      );

      expect(inScope).to.be(false);
    });

    it("should report in scope within a function inside the frame", () => {
      // on return insideClosure;
      const frame = {
        location: {
          line: 18,
          column: 7
        }
      };

      const location = {
        line: 15,
        column: 35
      };

      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "x",
        location,
        frame
      );

      expect(inScope).to.be(true);
    });
  });
});
