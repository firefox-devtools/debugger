/* eslint max-nested-callbacks: ["error", 4]*/

import { formatSymbols } from "../getSymbols";
import { getSource } from "./helpers";

describe("Parser.getSymbols", () => {
  it("es6", () => {
    const symbols = formatSymbols(getSource("es6"));
    expect(symbols).toMatchSnapshot();
  });

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

  it("expression", () => {
    const symbols = formatSymbols(getSource("expression"));
    expect(symbols).toMatchSnapshot();
  });

  it("allSymbols", () => {
    const symbols = formatSymbols(getSource("allSymbols"));
    expect(symbols).toMatchSnapshot();
  });

  it("call sites", () => {
    const symbols = formatSymbols(getSource("call-sites"));
    expect(symbols).toMatchSnapshot();
  });

  it("finds symbols in an html file", () => {
    const symbols = formatSymbols(getSource("parseScriptTags", "html"));
    expect(symbols).toMatchSnapshot();
  });

  it("component", () => {
    const symbols = formatSymbols(getSource("component"));
    expect(symbols).toMatchSnapshot();
  });
});
