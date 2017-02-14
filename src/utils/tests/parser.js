const expect = require("expect.js");
const { parse, getFunctions, getPathClosestToLocation } = require("../parser");

// re-formats the code to correct for webpack indentations
function formatCode(text) {
  const lines = text.split("\n")
  const indent = lines[1].match(/^\s*/)[0].length
  return lines.map(line => line.slice(indent)).join("\n")
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
  render: function () {
    return this;
  },
});
`);

describe("parser", () => {
  describe("getFunctions", () => {
    it("finds square", () => {
      parse({ text: func }, { id: "func" });
      const fncs = getFunctions({ id: "func" });
      const names = fncs.map(f => f.name);

      expect(names).to.eql(["square"]);
    });

    it("finds nested functions", () => {
      parse({ text: math }, { id: "math" });
      const fncs = getFunctions({ id: "math" });
      const names = fncs.map(f => f.name);

      expect(names).to.eql(["math", "square"]);
    });

    it("finds object properties", () => {
      parse({ text: proto }, { id: "proto" });
      const fncs = getFunctions({ id: "proto" });
      const names = fncs.map(f => f.name);

      expect(names).to.eql([ "foo", "bar", "initialize", "render"]);
    })
  });

  describe("getPathClosestToLocation", () => {
    parse({ text: func }, { id: "func" });

    it("Can find the function declaration for square", () => {
      const closestPath = getPathClosestToLocation(
        { id: "func" },
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
        { id: "func" },
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
  });
});
