/* eslint max-nested-callbacks: ["error", 4]*/

import { formatSymbols } from "../getSymbols";
import { getSource } from "./helpers";

describe("Parser.getSymbols", () => {
  it("func", () => {
    const symbols = formatSymbols(getSource("func"));
    expect(symbols).toMatchSnapshot();
  });

  it("math", () => {
    const symbols = formatSymbols(getSource("math"));
    expect(symbols).toMatchSnapshot();
  });

  it("proto", () => {
    const symbols = formatSymbols(getSource("proto"));
    expect(symbols).toMatchSnapshot();
  });

  it("class", () => {
    const symbols = formatSymbols(getSource("class"));
    expect(symbols).toMatchSnapshot();
  });

  it("var", () => {
    const symbols = formatSymbols(getSource("var"));
    expect(symbols).toMatchSnapshot();
  });

  fit("expression", () => {
    const symbols = formatSymbols(getSource("expression"));
    expect(symbols).toMatchSnapshot();
  });

  it("allSymbols", () => {
    const symbols = formatSymbols(getSource("allSymbols"));
    expect(symbols).toMatchSnapshot();
  });

  it("finds symbols in an html file", () => {
    const symbols = formatSymbols(getSource("parseScriptTags", "html"));
    expect(symbols).toMatchSnapshot();
  });
});
