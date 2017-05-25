/* eslint max-nested-callbacks: ["error", 4]*/

const expect = require("expect.js");
import getSymbols from "../getSymbols";

import { getSourceText } from "./helpers";

describe("Parser.getSymbols", () => {
  describe("functions", () => {
    it("finds functions", () => {
      const fncs = getSymbols(getSourceText("func")).functions;

      const names = fncs.map(f => f.name);

      expect(names).to.eql(["square", "child", "anonymous"]);
    });

    it("finds nested functions", () => {
      const fncs = getSymbols(getSourceText("math")).functions;
      const names = fncs.map(f => f.name);

      expect(names).to.eql(["math", "square", "child", "child2"]);
    });

    it("finds object properties", () => {
      const fncs = getSymbols(getSourceText("proto")).functions;
      const names = fncs.map(f => f.name);

      expect(names).to.eql(["foo", "bar", "initialize", "doThing", "render"]);
    });

    it("finds class methods", () => {
      const fncs = getSymbols(getSourceText("class")).functions;
      const names = fncs.map(f => f.name);
      expect(names).to.eql(["constructor", "bar"]);
    });
  });

  describe("variables", () => {
    it("finds var, let, const", () => {
      const vars = getSymbols(getSourceText("var")).variables;
      const names = vars.map(v => v.name);
      expect(names).to.eql(["foo", "bar", "baz", "a", "b"]);
    });

    it("finds arguments, properties", () => {
      const protoVars = getSymbols(getSourceText("proto")).variables;
      const classVars = getSymbols(getSourceText("class")).variables;
      const protoNames = protoVars.map(v => v.name);
      const classNames = classVars.map(v => v.name);
      expect(protoNames).to.eql(["foo", "bar", "TodoView", "tagName", "b"]);
      expect(classNames).to.eql(["Test", "a", "Test2", "expressiveClass"]);
    });
  });

  describe("All together", () => {
    it("finds function, variable and class declarations", () => {
      const allSymbols = getSymbols(getSourceText("allSymbols"));
      expect(allSymbols.functions.map(f => f.name)).to.eql([
        "incrementCounter",
        "sum",
        "doThing",
        "doOtherThing",
        "property",
        "constructor",
        "beAwesome"
      ]);
      expect(allSymbols.variables.map(v => v.name)).to.eql([
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
      const allSymbols = getSymbols(getSourceText("parseScriptTags", "html"));
      expect(allSymbols.functions.map(f => f.name)).to.eql([
        "sayHello",
        "capitalize",
        "iife"
      ]);
      expect(allSymbols.variables.map(v => v.name)).to.eql([
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
