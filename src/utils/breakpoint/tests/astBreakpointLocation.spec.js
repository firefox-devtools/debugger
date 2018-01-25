import { getASTLocation } from "../astBreakpointLocation.js";
import { getSource } from "../../../workers/parser/tests/helpers";
import getSymbols from "../../../workers/parser/getSymbols";
import cases from "jest-in-case";

import * as I from "immutable";

async function setup({ fileName, location, functionName }) {
  const source = I.Map(getSource(fileName));
  const symbols = getSymbols(source.toJS());

  const astLocation = getASTLocation(source, symbols, location);
  expect(astLocation.name).toBe(functionName);
  expect(astLocation).toMatchSnapshot();
}

describe("ast", () => {
  cases("valid location", setup, [
    {
      name: "returns the scope and offset",
      fileName: "math",
      location: { line: 6, column: 0 },
      functionName: "math"
    },
    {
      name: "returns name for a nested anon fn as the parent func",
      fileName: "outOfScope",
      location: { line: 25, column: 0 },
      functionName: "outer"
    },
    {
      name: "returns name for a nested named fn",
      fileName: "outOfScope",
      location: { line: 5, column: 0 },
      functionName: "inner"
    },
    {
      name: "returns name for an anon fn with a named variable",
      fileName: "outOfScope",
      location: { line: 40, column: 0 },
      functionName: "globalDeclaration"
    }
  ]);

  cases("invalid location", setup, [
    {
      name: "returns the scope name for global scope as undefined",
      fileName: "class",
      location: { line: 10, column: 0 },
      functionName: undefined
    },
    {
      name: "returns name for an anon fn in global scope as undefined",
      fileName: "outOfScope",
      location: { line: 44, column: 0 },
      functionName: undefined
    }
  ]);
});
