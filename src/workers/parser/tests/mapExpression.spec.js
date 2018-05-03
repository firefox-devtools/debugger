import mapExpression from "../mapExpression";
import { format } from "prettier";
import cases from "jest-in-case";

function test({
  expression,
  newExpression,
  bindings,
  mappings,
  shouldMapExpression
}) {
  expect(
    format(mapExpression(expression, mappings, bindings, shouldMapExpression))
  ).toEqual(format(newExpression));
}

describe("mapExpression", () => {
  cases("mapExpressions", test, [
    {
      name: "simple",
      expression: "a",
      newExpression: "a",
      bindings: [],
      mappings: {},
      shouldMapExpression: true
    },
    {
      name: "mappings",
      expression: "a",
      newExpression: "_a",
      bindings: [],
      mappings: {
        a: "_a"
      },
      shouldMapExpression: true
    },
    {
      name: "declaration",
      expression: "var a = 3;",
      newExpression: "self.a = 3",
      bindings: [],
      mappings: {},
      shouldMapExpression: true
    },
    {
      name: "bindings",
      expression: "var a = 3;",
      newExpression: "a = 3",
      bindings: ["a"],
      mappings: {},
      shouldMapExpression: true
    },
    {
      name: "bindings + mappings",
      expression: "a = 3;",
      newExpression: "self.a = 3",
      bindings: ["_a"],
      mappings: { a: "_a" },
      shouldMapExpression: true
    },
    {
      name: "bindings without mappings",
      expression: "a = 3;",
      newExpression: "a = 3",
      bindings: [],
      mappings: { a: "_a" },
      shouldMapExpression: false
    }
  ]);
});
