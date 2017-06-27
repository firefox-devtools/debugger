/* eslint max-nested-callbacks: ["error", 4]*/

import getSymbols, { printSymbols } from "../getSymbols";
import { getSource } from "./helpers";

describe("Parser.getSymbols", () => {
  describe("functions", () => {
    it("finds functions", () => {
      const fncs = getSymbols(getSource("func")).functions;

      const names = fncs.map(f => f.name);
      expect(names).toEqual(["square", "child", "anonymous"]);
    });

    it("finds functions parameters", () => {
      const fncs = getSymbols(getSource("func")).functions;

      const names = fncs.map(f => f.parameterNames);
      expect(names).toEqual([["n"], [], []]);
    });

    it("finds nested functions", () => {
      const fncs = getSymbols(getSource("math")).functions;
      const names = fncs.map(f => f.name);

      expect(names).toEqual(["math", "square", "child", "child2"]);
    });

    it("finds object properties", () => {
      const fncs = getSymbols(getSource("proto")).functions;
      const names = fncs.map(f => f.name);

      expect(names).toEqual(["foo", "bar", "initialize", "doThing", "render"]);
    });

    it("finds class methods", () => {
      const fncs = getSymbols(getSource("class")).functions;
      const names = fncs.map(f => f.name);
      expect(names).toEqual(["constructor", "bar"]);
    });
  });

  describe("variables", () => {
    it("finds var, let, const", () => {
      const vars = getSymbols(getSource("var")).variables;
      const names = vars.map(v => v.name);
      expect(names).toEqual(["foo", "bar", "baz", "a", "b"]);
    });

    it("finds arguments, properties", () => {
      const protoVars = getSymbols(getSource("proto")).variables;
      const classVars = getSymbols(getSource("class")).variables;
      const protoNames = protoVars.map(v => v.name);
      const classNames = classVars.map(v => v.name);
      expect(protoNames).toEqual(["foo", "bar", "TodoView", "tagName", "b"]);
      expect(classNames).toEqual(["Test", "a", "Test2", "expressiveClass"]);
    });
  });

  describe("properties", () => {
    it("properties", () => {
      const { objectProperties } = getSymbols(getSource("expression"));
      expect(objectProperties).toMatchSnapshot();
    });

    it("identifiers", () => {
      const { identifiers } = getSymbols(getSource("expression"));
      expect(identifiers).toMatchSnapshot();
    });

    it("members", () => {
      const { memberExpressions } = getSymbols(getSource("expression"));
      expect(memberExpressions).toMatchSnapshot();
    });
  });

  describe("All together", () => {
    it("finds function, variable and class declarations", () => {
      const allSymbols = getSymbols(getSource("allSymbols"));
      expect(allSymbols.functions.map(f => f.name)).toEqual([
        "incrementCounter",
        "sum",
        "doThing",
        "doOtherThing",
        "property",
        "constructor",
        "beAwesome"
      ]);
      expect(allSymbols.variables.map(v => v.name)).toEqual([
        "TIME",
        "count",
        "counter",
        "sum",
        "a",
        "b",
        "Obj",
        "foo",
        "Ultra",
        "person"
      ]);
    });
  });

  describe("<script> content", () => {
    it("finds function, variable and class declarations", () => {
      const allSymbols = getSymbols(getSource("parseScriptTags", "html"));
      expect(allSymbols.functions.map(f => f.name)).toEqual([
        "sayHello",
        "capitalize",
        "iife"
      ]);
      expect(allSymbols.variables.map(v => v.name)).toEqual([
        "globalObject",
        "first",
        "last",
        "name",
        "capitalize",
        "name",
        "greetAll",
        "greeting"
      ]);
    });
  });
});
