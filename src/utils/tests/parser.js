const expect = require("expect.js");
import {
  getSymbols,
  getVariablesInLocalScope,
  getVariablesInScope,
  getClosestScope,
  getClosestExpression,
  resolveToken
} from "../parser/utils";

const fs = require("fs");
const path = require("path");

function getSourceText(name, type = "js") {
  const text = fs.readFileSync(
    path.join(__dirname, `fixtures/${name}.${type}`),
    "utf8"
  );
  const contentType = type === "html" ? "text/html" : "text/javascript";
  return {
    id: name,
    text,
    contentType
  };
}

describe("parser", () => {
  describe("getSymbols -> functions", () => {
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

  describe("getSymbols -> variables", () => {
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

  describe("getSymbols -> All together", () => {
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

  describe("getSymbols -> <script> content", () => {
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

  describe("getClosestExpression", () => {
    it("Can find a member expression", () => {
      const expression = getClosestExpression(
        getSourceText("resolveToken"),
        "x",
        {
          line: 15,
          column: 31
        }
      );

      expect(expression.value).to.be("obj.x");
      expect(expression.location.start).to.eql({
        line: 15,
        column: 26
      });
    });

    it("Can find a local var", () => {
      const expression = getClosestExpression(
        getSourceText("resolveToken"),
        "beta",
        {
          line: 15,
          column: 21
        }
      );

      expect(expression.value).to.be("beta");
      expect(expression.location.start).to.eql({
        line: 15,
        column: 19
      });
    });
  });

  describe("getClosestScope", () => {
    it("finds the scope at the beginning", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 5,
        column: 8
      });

      const node = scope.block;

      expect(node.id).to.be(null);
      expect(node.loc.start).to.eql({
        line: 5,
        column: 8
      });
      expect(node.type).to.be("FunctionExpression");
    });

    it("finds a scope given at the end", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 9,
        column: 1
      });

      const node = scope.block;
      expect(node.id).to.be(null);
      expect(node.loc.start).to.eql({
        line: 7,
        column: 1
      });
      expect(node.type).to.be("FunctionExpression");
    });

    it("Can find the function declaration for square", () => {
      const scope = getClosestScope(getSourceText("func"), {
        line: 1,
        column: 1
      });

      const node = scope.block;
      expect(node.id.name).to.be("square");
      expect(node.loc.start).to.eql({
        line: 1,
        column: 0
      });
      expect(node.type).to.be("FunctionDeclaration");
    });
  });

  describe("getVariablesInLocalScope", () => {
    it("finds scope binding variables", () => {
      const scope = getClosestScope(getSourceText("math"), {
        line: 2,
        column: 2
      });

      var vars = getVariablesInLocalScope(scope);
      expect(vars.map(v => v.name)).to.eql(["n"]);
      expect(vars[0].references[0].node.loc.start).to.eql({
        column: 4,
        line: 3
      });
    });

    it("only gets local variables", () => {
      const scope = getClosestScope(getSourceText("math"), {
        line: 3,
        column: 5
      });

      var vars = getVariablesInLocalScope(scope);

      expect(vars.map(v => v.name)).to.eql(["n"]);
      expect(vars[0].references[0].node.loc.start).to.eql({
        column: 4,
        line: 3
      });
    });
  });

  describe("getVariablesInScope", () => {
    it("finds scope binding variables", () => {
      const scope = getClosestScope(getSourceText("math"), {
        line: 3,
        column: 5
      });

      var vars = getVariablesInScope(scope);

      expect(vars).to.eql([
        "this",
        "arguments",
        "n",
        "square",
        "two",
        "four",
        "math",
        "child"
      ]);
    });
  });

  describe("resolveToken", () => {
    it("should get the expression for the token at location", () => {
      const { expression, inScope } = resolveToken(
        getSourceText("expression"),
        "b",
        {
          line: 5,
          column: 16
        },
        {
          location: {
            line: 1,
            column: 18
          }
        }
      );

      expect(inScope).to.be(true);
      expect(expression.value).to.be("obj.a.b");
      expect(expression.location.start).to.eql({
        line: 5,
        column: 9
      });
    });

    it("should not find any expression", () => {
      const { expression, inScope } = resolveToken(
        getSourceText("expression"),
        "d",
        {
          line: 6,
          column: 14
        },
        {
          location: {
            line: 1,
            column: 18
          }
        }
      );

      expect(expression).to.be(null);
      expect(inScope).to.be(false);
    });

    it("should not find the expression at a wrong location", () => {
      const { expression, inScope } = resolveToken(
        getSourceText("expression"),
        "b",
        {
          line: 6,
          column: 0
        },
        {
          location: {
            line: 1,
            column: 18
          }
        }
      );

      expect(expression).to.be(null);
      expect(inScope).to.be(false);
    });

    it("should get the expression with 'this'", () => {
      const { expression } = resolveToken(
        getSourceText("thisExpression"),
        "a",
        { line: 9, column: 25 },
        {
          location: {
            line: 2,
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

    it("should get 'this' expression", () => {
      const { expression } = resolveToken(
        getSourceText("thisExpression"),
        "this",
        { line: 3, column: 5 },
        {
          location: {
            line: 2,
            column: 18
          }
        }
      );

      expect(expression.value).to.be("this");
      expect(expression.location.start).to.eql({
        line: 3,
        column: 4
      });
    });

    it("should report in scope when in the same function as frame", () => {
      const frame = {
        location: {
          line: 9,
          column: 7
        }
      };
      const location = {
        line: 8,
        column: 11
      };

      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "newB",
        location,
        frame
      );

      expect(inScope).to.be(true);
    });

    it("should report out of scope when in a different function", () => {
      const location = {
        line: 5,
        column: 7
      };

      // on return a;
      const frame = {
        location: {
          line: 8,
          column: 11
        }
      };
      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "newB",
        location,
        frame
      );

      expect(inScope).to.be(false);
    });

    it("should report in scope within a function inside the frame", () => {
      // on return insideClosure;
      const frame = {
        location: {
          line: 18,
          column: 7
        }
      };

      const location = {
        line: 15,
        column: 35
      };

      const { inScope } = resolveToken(
        getSourceText("resolveToken"),
        "x",
        location,
        frame
      );

      expect(inScope).to.be(true);
    });
  });
});
