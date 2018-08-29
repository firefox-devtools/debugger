/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
    format(mapExpression(expression, mappings, bindings, shouldMapExpression), {
      parser: "babylon"
    })
  ).toEqual(format(newExpression, { parser: "babylon" }));
}

function formatAwait(body) {
  return `(async () => {
    ${body}
  })().then(r => console.log(r));`;
}

describe("mapExpression", () => {
  cases("mapExpressions", test, [
    {
      name: "await",
      expression: "await a()",
      newExpression: formatAwait("return await a()"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true
    },
    {
      name: "await (multiple statements)",
      expression: "const x = await a(); x + x",
      newExpression: formatAwait("self.x = await a(); return x + x;"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true
    },
    {
      name: "await (inner)",
      expression: "async () => await a();",
      newExpression: "async () => await a();",
      bindings: [],
      mappings: {},
      shouldMapExpression: true
    },
    {
      name: "await (multiple awaits)",
      expression: "const x = await a(); await b(x)",
      newExpression: formatAwait("self.x = await a(); return await b(x);"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true
    },
    {
      name: "await (assignment)",
      expression: "let x = await sleep(100, 2)",
      newExpression: formatAwait("return (self.x = await sleep(100, 2))"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true
    },
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
