const {
  makeNodesForProperties,
  isPromise,
  getPromiseProperties,
  isDefault
} = require("../object-inspector");

const root = {
  path: "root",
  contents: { value: {} }
};

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
    actor: "server2.conn1.child1/pausedobj618",
    class: "bla"
  }
};

describe("object-inspector", () => {
  describe("makeNodesForProperties", () => {
    it("kitchen sink", () => {
      // console.log(this.root);
      const nodes = makeNodesForProperties(objProperties, root);

      const names = nodes.map(n => n.name);
      expect(names).toEqual(["0", "length", "__proto__"]);

      const paths = nodes.map(n => n.path);
      expect(paths).toEqual(["root/0", "root/length", "root/__proto__"]);
    });

    it("excludes getters", () => {
      const nodes = makeNodesForProperties(
        {
          ownProperties: {
            foo: { value: "foo" },
            bar: {}
          },
          prototype: {
            class: "bla"
          }
        },
        root
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).toEqual(["foo", "__proto__"]);
      expect(paths).toEqual(["root/foo", "root/__proto__"]);
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
          },
          prototype: {
            class: "bla"
          }
        },
        root
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).toEqual(["1", "2", "11", "_bar", "bar", "__proto__"]);
      expect(paths).toEqual([
        "root/1",
        "root/2",
        "root/11",
        "root/_bar",
        "root/bar",
        "root/__proto__"
      ]);
    });

    it("prototype is included", () => {
      const nodes = makeNodesForProperties(
        {
          ownProperties: {
            bar: { value: {} }
          },
          prototype: { value: {}, class: "bla" }
        },
        root
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).toEqual(["bar", "__proto__"]);
      expect(paths).toEqual(["root/bar", "root/__proto__"]);
    });

    it("window object", () => {
      const nodes = makeNodesForProperties(
        {
          ownProperties: {
            bar: { value: {} },
            location: { value: {} }
          },
          class: "Window"
        },
        {
          path: "root",
          contents: { value: { class: "Window" } }
        }
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).toEqual(["bar", "[default properties]"]);
      expect(paths).toEqual(["root/bar", "root/##-default"]);
    });

    it("window prop on normal object", () => {
      const windowRoots = [
        {
          contents: { value: { class: "Window" } }
        }
      ];

      const objectRoots = [
        {
          contents: { value: { class: "Object" } }
        }
      ];

      const item = { name: "location" };

      expect(isDefault(item, windowRoots)).toEqual(true);
      expect(isDefault(item, objectRoots)).toEqual(false);
    });

    // For large arrays
    it("numerical buckets", () => {
      let objProps = { ownProperties: {}, prototype: { class: "Array" } };
      for (let i = 0; i < 331; i++) {
        objProps.ownProperties[i] = { value: {} };
      }
      const nodes = makeNodesForProperties(objProps, root);

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).toEqual([
        "[0..99]",
        "[100..199]",
        "[200..299]",
        "[300..331]",
        "__proto__"
      ]);

      expect(paths).toEqual([
        "root/bucket1",
        "root/bucket2",
        "root/bucket3",
        "root/bucket4",
        "root/__proto__"
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
          },
          prototype: {
            class: "WindowPrototype"
          }
        },
        root
      );

      const names = nodes.map(n => n.name);
      const paths = nodes.map(n => n.path);

      expect(names).toEqual([
        '""',
        "332217",
        '"needs-quotes"',
        "unquoted",
        "__proto__"
      ]);
      expect(paths).toEqual([
        "root/",
        "root/332217",
        "root/needs-quotes",
        "root/unquoted",
        "root/__proto__"
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

    expect(isPromise(promise)).toEqual(true);
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
    expect(node.contents.value.type).toEqual("3");
  });
});
