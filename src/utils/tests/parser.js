const expect = require("expect.js");
const {
  parse,
  getSymbols,
  getVariablesInScope,
  getPathClosestToLocation
} = require("../parser");

// re-formats the code to correct for webpack indentations
function formatCode(text) {
  const lines = text.split("\n");
  const indent = lines[1].match(/^\s*/)[0].length;
  return lines.map(line => line.slice(indent)).join("\n");
}

const SOURCES = {
  func: formatCode(`
    function square(n) {
      return n * n;
    }
  `),
  math: formatCode(`
    function math(n) {
      function square(n) { n * n}
      const two = square(2);
      const four = squaare(4);
      return two * four;
    }
  `),
  proto: formatCode(`
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
  `),
  classTest: formatCode(`
    class Test {
      constructor() {
        this.foo = "foo"
      }

      bar(a) {
        console.log("bar", a);
      }
    };

    class Test2 {}
  `),
  varTest: formatCode(`
    var foo = 1;
    let bar = 2;
    const baz = 3;
    const a = 4, b = 5;
  `),
  allSymbols: formatCode(`
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

    class Ultra {
      constructor() {
        this.awesome = true;
      }

      beAwesome(person) {
        console.log(person + " is Awesome!");
      }
    };
  `)
};

function getSourceText(name) {
  return {
    id: name,
    text: SOURCES[name],
    contentType: "text/javascript"
  };
}

describe("parser", () => {
  describe("getSymbols -> functions", () => {
    it("finds square", () => {
      const fncs = getSymbols(getSourceText("func")).functions;

      const names = fncs.map(f => f.name);

      expect(names).to.eql(["square"]);
    });

    it("finds nested functions", () => {
      const fncs = getSymbols(getSourceText("math")).functions;
      const names = fncs.map(f => f.name);

      expect(names).to.eql(["math", "square"]);
    });

    it("finds object properties", () => {
      const fncs = getSymbols(getSourceText("proto")).functions;
      const names = fncs.map(f => f.name);

      expect(names).to.eql([ "foo", "bar", "initialize", "doThing", "render"]);
    });

    it("finds class methods", () => {
      const fncs = getSymbols(getSourceText("classTest")).functions;
      const names = fncs.map(f => f.name);
      expect(names).to.eql([ "constructor", "bar"]);
    });
  });

  describe("getSymbols -> variables", () => {
    it("finds var, let, const", () => {
      const vars = getSymbols(getSourceText("varTest")).variables;
      const names = vars.map(v => v.name);
      expect(names).to.eql(["foo", "bar", "baz", "a", "b"]);
    });

    it("finds arguments, properties", () => {
      const protoVars = getSymbols(getSourceText("proto")).variables;
      const classVars = getSymbols(getSourceText("classTest")).variables;
      const protoNames = protoVars.map(v => v.name);
      const classNames = classVars.map(v => v.name);
      expect(protoNames).to.eql(["foo", "bar", "TodoView", "tagName", "b"]);
      expect(classNames).to.eql(["a"]);
    });
  });

  describe("getSymbols -> classes", () => {
    it("finds class declarations", () => {
      const classClasses = getSymbols(getSourceText("classTest")).classes;
      const classNames = classClasses.map(c => c.name);
      expect(classNames).to.eql(["Test", "Test2"]);
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
        "person"
      ]);
      expect(allSymbols.classes.map(c => c.name)).to.eql(["Ultra"]);
    });
  });

  describe("getPathClosestToLocation", () => {
    it("Can find the function declaration for square", () => {
      const closestPath = getPathClosestToLocation(
        getSourceText("func"),
        {
          line: 2,
          column: 1
        }
      );

      expect(closestPath.node.id.name).to.be("square");
      expect(closestPath.node.loc.start).to.eql({
        line: 2,
        column: 0
      });
      expect(closestPath.type).to.be("FunctionDeclaration");
    });

    it("Can find the path at the exact column", () => {
      const closestPath = getPathClosestToLocation(
        getSourceText("func"),
        {
          line: 2,
          column: 10
        }
      );

      expect(closestPath.node.loc.start).to.eql({
        line: 2,
        column: 9
      });
      expect(closestPath.type).to.be("Identifier");
    });

    it("finds scope binding variables", () => {
      parse({ text: SOURCES.math, id: "math" });
      var vars = getVariablesInScope(
        getSourceText("math"),
        {
          line: 2,
          column: 5
        }
      );

      expect(vars.map(v => v.name)).to.eql(["n", "square", "two", "four"]);
      expect(vars[1].references[0].node.loc.start).to.eql({
        column: 14,
        line: 4
      });
    });
  });
});
