const expect = require("expect.js");
const {
  getSymbols,
  getVariablesInScope,
  getExpression,
  getPathClosestToLocation,
} = require("../parser/utils");

// re-formats the code to correct for webpack indentations
function formatCode(text) {
  const lines = text.split("\n");
  const indent = lines[1].match(/^\s*/)[0].length;
  return lines.map(line => line.slice(indent)).join("\n");
}

const SOURCES = {
  func: formatCode(
    `
    function square(n) {
      return n * n;
    }

    child = function() {};

    (function () { 2 })();
  `
  ),
  math: formatCode(
    `
    function math(n) {
      function square(n) { n * n}
      const two = square(2);
      const four = squaare(4);
      return two * four;
    }

    var child = function() {};
    child2 = function() {};
  `
  ),
  proto: formatCode(
    `
    const foo = function() {}

    const bar = () => {}

    const TodoView = Backbone.View.extend({
      tagName:  'li',
      initialize: function () {},
      doThing(b) {
        console.log('hi', b);
      },
      render: function () {
        return this;
      },
    });
  `
  ),
  classTest: formatCode(
    `
    class Test {
      constructor() {
        this.foo = "foo"
      }

      bar(a) {
        console.log("bar", a);
      }
    };

    class Test2 {}

    let expressiveClass  = class {}
  `
  ),
  varTest: formatCode(
    `
    var foo = 1;
    let bar = 2;
    const baz = 3;
    const a = 4, b = 5;
  `
  ),
  expressionTest: formatCode(
    `
    function expr() {
      const obj = { a: { b: 2 }};
      const obj2 = { c: { b: 3 }};
      const foo = obj2.c.b;
      return obj.a.b;
    }
  `
  ),
  thisExpressionTest: formatCode(
    `
    class Test {
      constructor() {
        this.foo = {
          a: "foobar"
        }
      }

      bar() {
        console.log(this.foo.a);
      }
    };
  `
  ),
  allSymbols: formatCode(
    `
    const TIME = 60;
    let count = 0;

    function incrementCounter(counter) {
      return counter++;
    }

    const sum = (a, b) => a + b;

    const Obj = {
      foo: 1,
      doThing() {
        console.log('hey');
      },
      doOtherThing: function() {
        return 42;
      }
    };

    Obj.property = () => {}
    Obj.otherProperty = 1;

    class Ultra {
      constructor() {
        this.awesome = true;
      }

      beAwesome(person) {
        console.log(person + " is Awesome!");
      }
    };
  `
  ),
};

function getSourceText(name) {
  return {
    id: name,
    text: SOURCES[name],
    contentType: "text/javascript",
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
      const fncs = getSymbols(getSourceText("classTest")).functions;
      const names = fncs.map(f => f.value);
      expect(names).to.eql(["constructor", "bar"]);
    });
  });

  describe("getSymbols -> variables", () => {
    it("finds var, let, const", () => {
      const vars = getSymbols(getSourceText("varTest")).variables;
      const names = vars.map(v => v.value);
      expect(names).to.eql(["foo", "bar", "baz", "a", "b"]);
    });

    it("finds arguments, properties", () => {
      const protoVars = getSymbols(getSourceText("proto")).variables;
      const classVars = getSymbols(getSourceText("classTest")).variables;
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
        "beAwesome",
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
        "person",
      ]);
    });
  });

  describe("getExpression", () => {
    it("should get the expression for the token at location", () => {
      const expression = getExpression(getSourceText("expressionTest"), "b", {
        line: 6,
        column: 14,
      });

      expect(expression.value).to.be("obj.a.b");
      expect(expression.location.start).to.eql({
        line: 6,
        column: 9,
      });
    });

    it("should not find any expression", () => {
      const expression = getExpression(getSourceText("expressionTest"), "d", {
        line: 6,
        column: 14,
      });

      expect(expression).to.be(null);
    });

    it("should not find the expression at a wrong location", () => {
      const expression = getExpression(getSourceText("expressionTest"), "b", {
        line: 6,
        column: 0,
      });

      expect(expression).to.be(null);
    });

    it("should get the expression with 'this'", () => {
      const expression = getExpression(
        getSourceText("thisExpressionTest"),
        "a",
        { line: 10, column: 25 }
      );

      expect(expression.value).to.be("this.foo.a");
      expect(expression.location.start).to.eql({
        line: 10,
        column: 16,
      });
    });
  });

  describe("getPathClosestToLocation", () => {
    it("Can find the function declaration for square", () => {
      const closestPath = getPathClosestToLocation(getSourceText("func"), {
        line: 2,
        column: 1,
      });

      expect(closestPath.node.id.name).to.be("square");
      expect(closestPath.node.loc.start).to.eql({
        line: 2,
        column: 0,
      });
      expect(closestPath.type).to.be("FunctionDeclaration");
    });

    it("Can find the path at the exact column", () => {
      const closestPath = getPathClosestToLocation(getSourceText("func"), {
        line: 2,
        column: 10,
      });

      expect(closestPath.node.loc.start).to.eql({
        line: 2,
        column: 9,
      });
      expect(closestPath.type).to.be("Identifier");
    });

    it("finds scope binding variables", () => {
      var vars = getVariablesInScope(getSourceText("math"), {
        line: 2,
        column: 5,
      });

      expect(vars.map(v => v.name)).to.eql(["n", "square", "two", "four"]);
      expect(vars[1].references[0].node.loc.start).to.eql({
        column: 14,
        line: 4,
      });
    });
  });
});
