import { findBestMatchExpression } from "../ast";

import getSymbols from "../../workers/parser/getSymbols";
import { getSource } from "../../workers/parser/tests/helpers";
import { setSource } from "../../workers/parser/sources";

describe("find the best expression for the token", () => {
  const source = getSource("computed-props");
  setSource(source);
  const symbols = getSymbols("computed-props");

  it("should find the identifier", () => {
    const expression = findBestMatchExpression(
      symbols,
      { line: 1, column: 13 },
      "key"
    );
    expect(expression).toMatchSnapshot();
  });

  it("should find the expression for the property", () => {
    const expression = findBestMatchExpression(
      symbols,
      { line: 6, column: 16 },
      "b"
    );
    expect(expression).toMatchSnapshot();
  });

  it("should find the identifier for computed member expressions", () => {
    const expression = findBestMatchExpression(
      symbols,
      { line: 5, column: 6 },
      "key"
    );
    expect(expression).toMatchSnapshot();
  });
});
