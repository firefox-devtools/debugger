/* eslint max-nested-callbacks: ["error", 4]*/

import getScopes from "../getScopes";
import { setSource } from "../sources";
import { getOriginalSource } from "./helpers";

function parseScopes(name, line: number, column: number) {
  const source = getOriginalSource(name);
  setSource(source);

  return getScopes({
    sourceId: source.id,
    line,
    column
  });
}

describe("getScopes", () => {
  it("finds scope bindings in a module", () => {
    expect(parseScopes("scopes/simple-module", 7, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for function declarations", () => {
    expect(parseScopes("scopes/function-declaration", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/function-declaration", 3, 20)).toMatchSnapshot();
    expect(parseScopes("scopes/function-declaration", 5, 1)).toMatchSnapshot();
    expect(parseScopes("scopes/function-declaration", 9, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for function expressions", () => {
    expect(parseScopes("scopes/function-expression", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/function-expression", 3, 23)).toMatchSnapshot();
    expect(parseScopes("scopes/function-expression", 6, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for arrow functions", () => {
    expect(parseScopes("scopes/arrow-function", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/arrow-function", 4, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/arrow-function", 7, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/arrow-function", 8, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for class declarations", () => {
    expect(parseScopes("scopes/class-declaration", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/class-declaration", 5, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/class-declaration", 7, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for class expressions", () => {
    expect(parseScopes("scopes/class-expression", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/class-expression", 5, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/class-expression", 7, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for for loops", () => {
    expect(parseScopes("scopes/for-loops", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 3, 17)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 4, 17)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 5, 25)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 7, 22)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 8, 22)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 9, 23)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 11, 23)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 12, 23)).toMatchSnapshot();
    expect(parseScopes("scopes/for-loops", 13, 24)).toMatchSnapshot();
  });
  it("finds scope bindings for try..catch", () => {
    expect(parseScopes("scopes/try-catch", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/try-catch", 4, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/try-catch", 7, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for block statements", () => {
    expect(parseScopes("scopes/block-statement", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/block-statement", 6, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for class properties", () => {
    expect(parseScopes("scopes/class-property", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/class-property", 4, 16)).toMatchSnapshot();
    expect(parseScopes("scopes/class-property", 6, 12)).toMatchSnapshot();
    expect(parseScopes("scopes/class-property", 7, 0)).toMatchSnapshot();
  });
  it("finds scope bindings for switch statements", () => {
    expect(parseScopes("scopes/switch-statement", 2, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/switch-statement", 5, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/switch-statement", 7, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/switch-statement", 9, 0)).toMatchSnapshot();
    expect(parseScopes("scopes/switch-statement", 11, 0)).toMatchSnapshot();
  });
});
