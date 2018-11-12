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
  shouldMapExpression,
  expectedMapped
}) {
  const res = mapExpression(
    expression,
    mappings,
    bindings,
    shouldMapExpression
  );
  expect(
    format(res.expression, {
      parser: "babylon"
    })
  ).toEqual(format(newExpression, { parser: "babylon" }));
  expect(res.mapped).toEqual(expectedMapped);
}

function formatAwait(body) {
  return `(async () => { ${body} })();`;
}

describe("mapExpression", () => {
  cases("mapExpressions", test, [
    {
      name: "await",
      expression: "await a()",
      newExpression: formatAwait("return await a()"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: true,
        bindings: false,
        originalExpression: false
      }
    },
    {
      name: "await (multiple statements)",
      expression: "const x = await a(); x + x",
      newExpression: formatAwait("self.x = await a(); return x + x;"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: true,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "await (inner)",
      expression: "async () => await a();",
      newExpression: "async () => await a();",
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: false,
        originalExpression: false
      }
    },
    {
      name: "await (multiple awaits)",
      expression: "const x = await a(); await b(x)",
      newExpression: formatAwait("self.x = await a(); return await b(x);"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: true,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "await (assignment)",
      expression: "let x = await sleep(100, 2)",
      newExpression: formatAwait("return (self.x = await sleep(100, 2))"),
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: true,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "await (destructuring)",
      expression: "const { a, c: y } = await b()",
      newExpression: formatAwait(`let __decl0__ = await b();

      self.a = __decl0__.a;
      return (self.y = __decl0__.c);
    `),
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: true,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "await (destructuring, multiple statements)",
      expression: "const { a, c: y } = await b(), { x } = await y()",
      newExpression: formatAwait(`
        let __decl0__ = await b();

        self.a = __decl0__.a;
        self.y = __decl0__.c;

        let __decl1__ = await y();
    
        return (self.x = __decl1__.x);
    `),
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: true,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "await (destructuring, bindings)",
      expression: "const { a, c: y } = await b(), { x } = await y()",
      newExpression: formatAwait(`
        let __decl0__ = await b();

        a = __decl0__.a;
        y = __decl0__.c;

        let __decl1__ = await y();
    
        return (self.x = __decl1__.x);
    `),
      bindings: ["a", "y"],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: true,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "simple",
      expression: "a",
      newExpression: "a",
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: false,
        originalExpression: false
      }
    },
    {
      name: "mappings",
      expression: "a",
      newExpression: "_a",
      bindings: [],
      mappings: {
        a: "_a"
      },
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: false,
        originalExpression: true
      }
    },
    {
      name: "declaration",
      expression: "var a = 3;",
      newExpression: "self.a = 3",
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "declaration + destructuring",
      expression: "var { a } = { a: 3 };",
      newExpression: `let __decl0__ = {\n a: 3 \n}
      self.a = __decl0__.a;`,
      bindings: [],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "bindings",
      expression: "var a = 3;",
      newExpression: "a = 3",
      bindings: ["a"],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "bindings + destructuring",
      expression: "var { a } = { a: 3 };",
      newExpression: `let __decl0__ = { \n a: 3 \n }
      a = __decl0__.a`,
      bindings: ["a"],
      mappings: {},
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "bindings + mappings",
      expression: "a = 3;",
      newExpression: "self.a = 3",
      bindings: ["_a"],
      mappings: { a: "_a" },
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "bindings + mappings + destructuring",
      expression: "var { a } = { a: 4 }",
      newExpression: `let __decl0__ = {\n a: 4 \n};
      self.a = __decl0__.a;`,
      bindings: ["_a"],
      mappings: { a: "_a" },
      shouldMapExpression: true,
      expectedMapped: {
        await: false,
        bindings: true,
        originalExpression: false
      }
    },
    {
      name: "bindings without mappings",
      expression: "a = 3;",
      newExpression: "a = 3",
      bindings: [],
      mappings: { a: "_a" },
      shouldMapExpression: false,
      expectedMapped: {
        await: false,
        bindings: false,
        originalExpression: false
      }
    },
    {
      name: "bindings + destructuring without mappings",
      expression: "({ a } = { a: 4 })",
      newExpression: "({ a } = {\n a: 4 \n})",
      bindings: [],
      mappings: { a: "_a" },
      shouldMapExpression: false,
      expectedMapped: {
        await: false,
        bindings: false,
        originalExpression: false
      }
    }
  ]);
});
