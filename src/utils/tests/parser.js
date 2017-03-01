const expect = require("expect.js");
const {
  parse,
  getFunctions,
  getVariablesInScope,
  getPathClosestToLocation
} = require("../parser");

// re-formats the code to correct for webpack indentations
function formatCode(text) {
  const lines = text.split("\n");
  const indent = lines[1].match(/^\s*/)[0].length;
  return lines.map(line => line.slice(indent)).join("\n");
}

const func = formatCode(`
function square(n) {
  return n * n;
}
`);

const math = formatCode(`
function math(n) {
  function square(n) { n * n}
  const two = square(2);
  const four = squaare(4);
  return two * four;
}
`);

const proto = formatCode(`
const foo = function() {}

const bar = () => {}

const TodoView = Backbone.View.extend({
  tagName:  'li',
  initialize: function () {},
  doThing() {
    console.log('hi');
  },
  render: function () {
    return this;
  },
});
`);

const classTest = formatCode(`
  class Test {
    constructor() {
      this.foo = "foo"
    }

    bar() {
      console.log("bar");
    }
  }
`);

function getSourceText(name) {
  const sources = { func, math, proto, classTest };
  return {
    id: name,
    text: sources[name],
    contentType: "text/javascript"
  };
}

describe("parser", () => {
  describe("getFunctions", () => {
    it("finds square", () => {
      const fncs = getFunctions(getSourceText("func"));

      const names = fncs.map(f => f.name);

      expect(names).to.eql(["square"]);
    });

    it("finds nested functions", () => {
      const fncs = getFunctions(getSourceText("math"));
      const names = fncs.map(f => f.name);

      expect(names).to.eql(["math", "square"]);
    });

    it("finds object properties", () => {
      const fncs = getFunctions(getSourceText("proto"));
      const names = fncs.map(f => f.name);

      expect(names).to.eql([ "foo", "bar", "initialize", "doThing", "render"]);
    });

    it("finds class methods", () => {
      const fncs = getFunctions(getSourceText("classTest"));
      const names = fncs.map(f => f.name);
      expect(names).to.eql([ "constructor", "bar"]);
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
      parse({ text: math, id: "math" });
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
