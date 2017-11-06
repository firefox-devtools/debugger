/* eslint max-nested-callbacks: ["error", 4]*/

/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { formatSymbols } from "../utils/formatSymbols";
import { getSource } from "./helpers";
import cases from "jest-in-case";

cases(
  "Parser.getSymbols",
  ({ name, file, type }) =>
    expect(formatSymbols(getSource(file, type))).toMatchSnapshot(),
  [
    { name: "es6", file: "es6" },
    { name: "func", file: "func" },
    { name: "math", file: "math" },
    { name: "proto", file: "proto" },
    { name: "class", file: "class" },
    { name: "var", file: "var" },
    { name: "expression", file: "expression" },
    { name: "allSymbols", file: "allSymbols" },
    { name: "call sites", file: "call-sites" },
    {
      name: "finds symbols in an html file",
      file: "parseScriptTags",
      type: "html"
    },
    { name: "component", file: "component" },
    { name: "react component", file: "frameworks/component" }
  ]
);
