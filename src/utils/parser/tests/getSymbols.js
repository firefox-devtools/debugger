/* eslint max-nested-callbacks: ["error", 4]*/

import getSymbols from "../getSymbols";
import { getSource } from "./helpers";

describe("Parser.getSymbols", () => {
  it("func", () => {
    const symbols = getSymbols(getSource("func"));
    expect(symbols).toMatchSnapshot();
  });

  it("math", () => {
    const symbols = getSymbols(getSource("math"));
    expect(symbols).toMatchSnapshot();
  });

  it("proto", () => {
    const symbols = getSymbols(getSource("proto"));
    expect(symbols).toMatchSnapshot();
  });

  it("class", () => {
    const symbols = getSymbols(getSource("class"));
    expect(symbols).toMatchSnapshot();
  });

  it("var", () => {
    const symbols = getSymbols(getSource("var"));
    expect(symbols).toMatchSnapshot();
  });

  it("expression", () => {
    const symbols = getSymbols(getSource("expression"));
    expect(symbols).toMatchSnapshot();
  });

  it("allSymbols", () => {
    const symbols = getSymbols(getSource("allSymbols"));
    expect(symbols).toMatchSnapshot();
  });

  it("finds symbols in an html file", () => {
    const symbols = getSymbols(getSource("parseScriptTags", "html"));
    expect(symbols).toMatchSnapshot();
  });
});
