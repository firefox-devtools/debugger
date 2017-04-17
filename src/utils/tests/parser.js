const expect = require("expect.js");
import {
  getSymbols,
  getVariablesInScope,
  getPathClosestToLocation,
  resolveToken
} from "../parser/utils";

const fs = require("fs");
const path = require("path");

function getSourceText(name) {
  const text = fs.readFileSync(
    path.join(__dirname, `fixtures/${name}.js`),
    "utf8"
  );
  return {
    id: name,
    text: text,
    contentType: "text/javascript"
  };
}

describe("parser", () => {
  describe("getSymbols -> functions", () => {
    it("finds functions", () => {
      const fncs = getSymbols(getSourceText("func")).functions;

      const names = fncs.map(f => f.value);

      expect(names).to.eql(["square", "child", "anonymous"]);
    });

    it("finds nested functions", () => {
      const fncs = getSymbols(getSourceText("math")).functions;
      const names = fncs.map(f => f.value);

      expect(names).to.eql(["math", "square", "child", "child2"]);
    });

    it("finds object properties", () => {
      const fncs = getSymbols(getSourceText("proto")).functions;
      const names = fncs.map(f => f.value);

      expect(names).to.eql(["foo", "bar", "initialize", "doThing", "render"]);
    });

    it("finds class methods", () => {
      const fncs = getSymbols(getSourceText("class")).functions;
      const names = fncs.map(f => f.value);
      expect(names).to.eql(["constructor", "bar"]);
    });
  });

  describe("getSymbols -> variables", () => {
    it("finds var, let, const", () => {
      const vars = getSymbols(getSourceText("var")).variables;
      const names = vars.map(v => v.value);
      expect(names).to.eql(["foo", "bar", "baz", "a", "b"]);
    });

    it("finds arguments, properties", () => {
      const protoVars = getSymbols(getSourceText("proto")).variables;
      const classVars = getSymbols(getSourceText("class")).variables;
      const protoNames = protoVars.map(v => v.value);
      const classNames = classVars.map(v => v.value);
      expect(protoNames).to.eql(["foo", "bar", "TodoView", "tagName", "b"]);
      expect(classNames).to.eql(["Test", "a", "Test2", "expressiveClass"]);
    });
  });

  describe("getSymbols -> All together", () => {
    it("finds function, variable and class declarations", () => {
      const allSymbols = getSymbols(getSourceText("allSymbols"));
      expect(allSymbols.functions.map(f => f.value)).to.eql([
        "incrementCounter",
        "sum",
        "doThing",
        "doOtherThing",
        "property",
        "constructor",
        "beAwesome"
      ]);
      expect(allSymbols.variables.map(v => v.value)).to.eql([
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

  describe("getPathClosestToLocation", () => {
    it("Can find the function declaration for square", () => {
      const closestPath = getPathClosestToLocation(getSourceText("func"), {
        line: 1,
        column: 1
      });

      expect(closestPath.node.id.name).to.be("square");
      expect(closestPath.node.loc.start).to.eql({
        line: 1,
        column: 0
      });
      expect(closestPath.type).to.be("FunctionDeclaration");
    });

    it("Can find the path at the exact column", () => {
      const closestPath = getPathClosestToLocation(getSourceText("func"), {
        line: 2,
        column: 10
      });

      expect(closestPath.node.loc.start).to.eql({
        line: 2,
        column: 9
      });
      expect(closestPath.type).to.be("Identifier");
    });

    it("finds scope binding variables", () => {
      var vars = getVariablesInScope(getSourceText("math"), {
        line: 1,
        column: 5
      });

      expect(vars.map(v => v.name)).to.eql(["n", "square", "two", "four"]);
      expect(vars[1].references[0].node.loc.start).to.eql({
        column: 14,
        line: 5
      });
    });
  });

  describe("resolveToken", () => {
    it("should get the expression for the token at location", () => {
      const { expression } = resolveToken(
        getSourceText("expression"),
        "b",
        {
          line: 5,
          column: 14
        },
        {
          location: {
            line: 1,
            column: 1
          }
        }
      );

      expect(expression.value).to.be("obj.a.b");
      expect(expression.location.start).to.eql({
        line: 5,
        column: 9
      });
    });

    it("should not find any expression", () => {
      const { expression } = resolveToken(
        getSourceText("expression"),
        "d",
        {
          line: 6,
          column: 14
        },
        {
          location: {
            line: 1,
            column: 1
          }
        }
      );

      expect(expression).to.be(null);
    });

    it("should not find the expression at a wrong location", () => {
      const { expression } = resolveToken(
        getSourceText("expression"),
        "b",
        {
          line: 6,
          column: 0
        },
        {
          location: {
            line: 1,
            column: 1
          }
        }
      );

      expect(expression).to.be(null);
    });

    it("should get the expression with 'this'", () => {
      const { expression } = resolveToken(
        getSourceText("thisExpression"),
        "a",
        { line: 9, column: 25 },
        {
          location: {
            line: 1,
            column: 1
          }
        }
      );

      expect(expression.value).to.be("this.foo.a");
      expect(expression.location.start).to.eql({
        line: 9,
        column: 16
      });
    });

    it("should report in scope when in the same function as frame", () => {
      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "newB",
        {
          line: 8,
          column: 11
        },
        {
          // on b = newB;
          location: {
            line: 9,
            column: 7
          }
        }
      );

      expect(inScope).to.be(true);
    });

    it("should report out of scope when in a different function", () => {
      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "newB",
        {
          line: 8,
          column: 11
        },
        {
          // on return a;
          location: {
            line: 5,
            column: 7
          }
        }
      );

      expect(inScope).to.be(false);
    });

    it("should report in scope within a function inside the frame", () => {
      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "x",
        {
          line: 16,
          column: 35
        },
        {
          // on return insideClosure;
          location: {
            line: 19,
            column: 7
          }
        }
      );

      expect(inScope).to.be(true);
    });
  });
});
