/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  createNode,
  makeNodesForProperties,
  nodeIsDefaultProperties,
  nodeIsEntries,
  nodeIsMapEntry,
  nodeIsPrototype,
} = require("../../utils/node");
const gripArrayStubs = require("../../../reps/stubs/grip-array");

const root = {
  path: "root",
  contents: {
    value: gripArrayStubs.get("testBasic")
  }
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

describe("makeNodesForProperties", () => {
  it("kitchen sink", () => {
    const nodes = makeNodesForProperties(objProperties, root);

    const names = nodes.map(n => n.name);
    expect(names).toEqual(["0", "length", "<prototype>"]);

    const paths = nodes.map(n => n.path.toString());
    expect(paths).toEqual([
      "Symbol(root/0)",
      "Symbol(root/length)",
      "Symbol(root/<prototype>)",
    ]);
  });

  it("includes getters and setters", () => {
    const nodes = makeNodesForProperties(
      {
        ownProperties: {
          foo: { value: "foo" },
          bar: {
            "get": {
              "type": "object",
            },
            "set": {
              "type": "undefined"
            }
          },
          baz: {
            "get": {
              "type": "undefined"
            },
            "set": {
              "type": "object",
            }
          }
        },
        prototype: {
          class: "bla"
        }
      },
      root
    );

    const names = nodes.map(n => n.name);
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["bar", "baz", "foo", "<prototype>"]);
    expect(paths).toEqual([
      "Symbol(root/bar)",
      "Symbol(root/baz)",
      "Symbol(root/foo)",
      "Symbol(root/<prototype>)",
    ]);
  });

  it("does not include unrelevant properties", () => {
    const nodes = makeNodesForProperties(
      {
        ownProperties: {
          foo: undefined,
          bar: null,
          baz: {}
        },
      },
      root
    );

    const names = nodes.map(n => n.name);
    const paths = nodes.map(n => n.path);

    expect(names).toEqual([]);
    expect(paths).toEqual([]);
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
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["1", "2", "11", "_bar", "bar", "<prototype>"]);
    expect(paths).toEqual([
      "Symbol(root/1)",
      "Symbol(root/2)",
      "Symbol(root/11)",
      "Symbol(root/_bar)",
      "Symbol(root/bar)",
      "Symbol(root/<prototype>)",
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
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["bar", "<prototype>"]);
    expect(paths).toEqual(["Symbol(root/bar)", "Symbol(root/<prototype>)"]);

    expect(nodeIsPrototype(nodes[1])).toBe(true);
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
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["bar", "<default properties>"]);
    expect(paths).toEqual(["Symbol(root/bar)", "Symbol(root/<default properties>)"]);

    expect(nodeIsDefaultProperties(nodes[1])).toBe(true);
  });

  it("object with entries", () => {
    const gripMapStubs = require("../../../reps/stubs/grip-map");

    const mapNode = createNode({
      name: "map",
      path: "root",
      contents: {
        value: gripMapStubs.get("testSymbolKeyedMap")
      }
    });

    const nodes = makeNodesForProperties({
      ownProperties: {
        size: {value: 1},
        custom: {value: "customValue"}
      }
    }, mapNode);

    const names = nodes.map(n => n.name);
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["custom", "size", "<entries>"]);
    expect(paths).toEqual([
      "Symbol(root/custom)",
      "Symbol(root/size)",
      `Symbol(root/<entries>)`
    ]);

    const entriesNode = nodes[2];
    expect(nodeIsEntries(entriesNode)).toBe(true);

    const children = entriesNode.contents;

    // There are 2 entries in the map.
    expect(children.length).toBe(2);
    // And the 2 nodes created are typed as map entries.
    expect(children.every(child => nodeIsMapEntry(child))).toBe(true);

    const childrenNames = children.map(n => n.name);
    const childrenPaths = children.map(n => n.path.toString());
    expect(childrenNames).toEqual([0, 1]);
    expect(childrenPaths).toEqual([
      `Symbol(root/<entries>/0)`,
      `Symbol(root/<entries>/1)`
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
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual([
      '""',
      "332217",
      '"needs-quotes"',
      "unquoted",
      "<prototype>"
    ]);
    expect(paths).toEqual([
      `Symbol(root/"")`,
      `Symbol(root/332217)`,
      `Symbol(root/"needs-quotes")`,
      `Symbol(root/unquoted)`,
      `Symbol(root/<prototype>)`,
    ]);
  });
});
