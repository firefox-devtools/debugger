/* eslint max-nested-callbacks: ["error", 4]*/
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import getScopes from "../getScopes";
import { setSource } from "../sources";
import { getOriginalSource } from "./helpers";
import cases from "jest-in-case";

cases(
  "Parser.getScopes",
  ({ name, file, type, locations }) => {
    const source = getOriginalSource(file, type);
    setSource(source);

    locations.forEach(([line, column]) => {
      const scopes = getScopes({
        sourceId: source.id,
        line,
        column
      });

      expect(scopes).toMatchSnapshot(
        `getScopes ${name} at line ${line} column ${column}`
      );
    });
  },
  [
    {
      name: "finds scope bindings in a typescript file",
      file: "scopes/ts-sample",
      type: "ts",
      locations: [[3, 0], [6, 4]]
    },
    {
      name: "finds scope bindings in a module",
      file: "scopes/simple-module",
      locations: [[7, 0]]
    },
    {
      name: "finds scope bindings for complex binding nesting",
      file: "scopes/complex-nesting",
      locations: [[16, 4], [20, 6]]
    },
    {
      name: "finds scope bindings for function declarations",
      file: "scopes/function-declaration",
      locations: [[2, 0], [3, 20], [5, 1], [9, 0]]
    },
    {
      name: "finds scope bindings for function expressions",
      file: "scopes/function-expression",
      locations: [[2, 0], [3, 23], [6, 0]]
    },
    {
      name: "finds scope bindings for arrow functions",
      file: "scopes/arrow-function",
      locations: [[2, 0], [4, 0], [7, 0], [8, 0]]
    },
    {
      name: "finds scope bindings for class declarations",
      file: "scopes/class-declaration",
      locations: [[2, 0], [5, 0], [7, 0]]
    },
    {
      name: "finds scope bindings for class expressions",
      file: "scopes/class-expression",
      locations: [[2, 0], [5, 0], [7, 0]]
    },
    {
      name: "finds scope bindings for for loops",
      file: "scopes/for-loops",
      locations: [
        [2, 0],
        [3, 17],
        [4, 17],
        [5, 25],
        [7, 22],
        [8, 22],
        [9, 23],
        [11, 23],
        [12, 23],
        [13, 24]
      ]
    },
    {
      name: "finds scope bindings for try..catch",
      file: "scopes/try-catch",
      locations: [[2, 0], [4, 0], [7, 0]]
    },
    {
      name: "finds scope bindings for out of order declarations",
      file: "scopes/out-of-order-declarations",
      locations: [[2, 0], [5, 0], [11, 0], [14, 0], [17, 0]]
    },
    {
      name: "finds scope bindings for block statements",
      file: "scopes/block-statement",
      locations: [[2, 0], [6, 0]]
    },
    {
      name: "finds scope bindings for class properties",
      file: "scopes/class-property",
      locations: [[2, 0], [4, 16], [6, 12], [7, 0]]
    },
    {
      name: "finds scope bindings and exclude Flowtype",
      file: "scopes/flowtype-bindings",
      locations: [[6, 0], [8, 0]]
    },
    {
      name: "finds scope bindings for declarations with patterns",
      file: "scopes/pattern-declarations",
      locations: [[1, 0]]
    },
    {
      name: "finds scope bindings for switch statements",
      file: "scopes/switch-statement",
      locations: [[2, 0], [5, 0], [7, 0], [9, 0], [11, 0]]
    },
    {
      name: "finds scope bindings with proper types",
      file: "scopes/binding-types",
      locations: [[5, 0], [9, 0], [18, 0], [23, 0]]
    },
    {
      name: "finds scope bindings with expression metadata",
      file: "scopes/expressions",
      locations: [[2, 0]]
    }
  ]
);
