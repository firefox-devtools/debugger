const expect = require("expect.js");

const {
  makeNodesForProperties,
  isPromise,
  getPromiseProperties
} = require("../object-inspector");

const objProperties = {
  ownProperties: {
    "0": {
      value: {}
    },
    "2": {},
    length: {
      value: 3
    }
  },
  prototype: {
    type: "object",
    actor: "server2.conn1.child1/pausedobj618"
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
      const nodes = makeNodesForProperties(
        {
          ownProperties: {
            foo: { value: "foo" },
            bar: {}
          }
        },
        "root"
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql(["foo"]);
      expect(paths).to.eql(["root/foo"]);
    });

    it("sorts keys", () => {
      const nodes = makeNodesForProperties(
        {
          ownProperties: {
            bar: { value: {} },
            1: { value: {} },
            11: { value: {} },
            2: { value: {} },
            _bar: { value: {} }
          }
        },
        "root"
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql(["1", "2", "11", "_bar", "bar"]);
      expect(paths).to.eql([
        "root/1",
        "root/2",
        "root/11",
        "root/_bar",
        "root/bar"
      ]);
    });

    it("prototype is included", () => {
      const nodes = makeNodesForProperties(
        {
          ownProperties: {
            bar: { value: {} }
          },
          prototype: { value: {} }
        },
        "root"
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql(["bar", "__proto__"]);
      expect(paths).to.eql(["root/bar", "root/__proto__"]);
    });

    it("bucketing", () => {
      let objProps = { ownProperties: {} };
      for (let i = 0; i < 331; i++) {
        objProps.ownProperties[i] = { value: {} };
      }
      const nodes = makeNodesForProperties(objProps, "root");

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql([
        "[0..99]",
        "[100..199]",
        "[200..299]",
        "[300..331]"
      ]);

      expect(paths).to.eql([
        "root/bucket1",
        "root/bucket2",
        "root/bucket3",
        "root/bucket4"
      ]);
    });

    it("quotes property names", () => {
      const nodes = makeNodesForProperties(
        {
          ownProperties: {
            // Numbers are ok.
            332217: { value: {} },
            "needs-quotes": { value: {} },
            unquoted: { value: {} },
            "": { value: {} }
          }
        },
        "root"
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).to.eql(['""', "332217", '"needs-quotes"', "unquoted"]);
      expect(paths).to.eql([
        "root/",
        "root/332217",
        "root/needs-quotes",
        "root/unquoted"
      ]);
    });
  });
});

describe("promises", () => {
  it("is promise", () => {
    const promise = {
      contents: {
        enumerable: true,
        configurable: false,
        value: {
          frozen: false,
          ownPropertyLength: 0,
          preview: {
            kind: "Object",
            ownProperties: {},
            ownPropertiesLength: 0,
            safeGetterValues: {}
          },
          actor: "server2.conn2.child1/pausedobj36",
          promiseState: {
            state: "rejected",
            reason: {
              type: "undefined"
            },
            creationTimestamp: 1486584316133.3994,
            timeToSettle: 0.001713000237941742
          },
          class: "Promise",
          type: "object",
          extensible: true,
          sealed: false
        },
        writable: true
      }
    };

    expect(isPromise(promise)).to.eql(true);
  });

  it("getPromiseProperties", () => {
    const promise = {
      contents: {
        enumerable: true,
        configurable: false,
        value: {
          frozen: false,
          ownPropertyLength: 0,
          preview: {
            kind: "Object",
            ownProperties: {},
            ownPropertiesLength: 0,
            safeGetterValues: {}
          },
          actor: "server2.conn2.child1/pausedobj36",
          promiseState: {
            state: "rejected",
            reason: {
              type: "3"
            },
            creationTimestamp: 1486584316133.3994,
            timeToSettle: 0.001713000237941742
          },
          class: "Promise",
          type: "object",
          extensible: true,
          sealed: false
        },
        writable: true
      }
    };

    const node = getPromiseProperties(promise);
    expect(node.contents.value.type).to.eql("3");
  });
});
