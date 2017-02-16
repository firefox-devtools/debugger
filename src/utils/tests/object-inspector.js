const expect = require("expect.js");

const {
  makeNodesForProperties
} = require("../object-inspector");

const objProperties = {
  "ownProperties": {
    "0": {
      "value": {}
    },
    "2": {},
    "length": {
      "value": 3
    }
  },
  "prototype": {
    "type": "object",
    "actor": "server2.conn1.child1/pausedobj618",
  }
};

describe("object-inspector", () => {
  describe("makeNodesForProperties", () => {
    it("kitchen sink", () => {
      const nodes = makeNodesForProperties(objProperties, "root");

      const names = nodes.map(n => n.name);
      expect(names).to.eql(["0", "length", "__proto__"]);

      const paths = nodes.map(n => n.path);
      expect(paths).to.eql(["root/0", "root/length", "root/__proto__"]);
    });

    it("excludes getters", () => {
      const nodes = makeNodesForProperties({
        ownProperties: {
          foo: { value: "foo" },
          bar: {}
        }
      }, "root");

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql(["foo"]);
      expect(paths).to.eql(["root/foo"]);
    });

    it("sorts keys", () => {
      const nodes = makeNodesForProperties({
        ownProperties: {
          bar: { value: {}},
          1: { value: {}},
          11: { value: {}},
          2: { value: {}},
          _bar: { value: {}}
        }
      }, "root");

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql(["1", "2", "11", "_bar", "bar"]);
      expect(paths).to.eql([
        "root/1", "root/2", "root/11", "root/_bar", "root/bar"
      ]);
    });

    it("prototype is included", () => {
      const nodes = makeNodesForProperties({
        ownProperties: {
          bar: { value: {}},
        },
        prototype: { value: {}}
      }, "root");

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql(["bar", "__proto__"]);
      expect(paths).to.eql([
        "root/bar", "root/__proto__"
      ]);
    });
  });
});
