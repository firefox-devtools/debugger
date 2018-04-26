/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const accessorStubs = require("../../../reps/stubs/accessor");
const performanceStubs = require("../../stubs/performance");
const gripMapStubs = require("../../../reps/stubs/grip-map");
const gripArrayStubs = require("../../../reps/stubs/grip-array");
const gripMapEntryStubs = require("../../../reps/stubs/grip-map-entry");
const gripStubs = require("../../../reps/stubs/grip");

const {
  createNode,
  getChildren,
  getValue,
} = require("../../utils/node");

describe("getChildren", () => {
  it("accessors - getter", () => {
    const nodes = getChildren({
      item: createNode({
        name: "root",
        path: "rootpath",
        contents: accessorStubs.get("getter")
      })
    });

    const names = nodes.map(n => n.name);
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["<get>"]);
    expect(paths).toEqual([`Symbol(rootpath/<get>)`]);
  });

  it("accessors - setter", () => {
    const nodes = getChildren({
      item: createNode({
        name: "root",
        path: "rootpath",
        contents: accessorStubs.get("setter")
      })
    });

    const names = nodes.map(n => n.name);
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["<set>"]);
    expect(paths).toEqual([`Symbol(rootpath/<set>)`]);
  });

  it("accessors - getter & setter", () => {
    const nodes = getChildren({
      item: createNode({
        name: "root",
        path: "rootpath",
        contents: accessorStubs.get("getter setter")
      })
    });

    const names = nodes.map(n => n.name);
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["<get>", "<set>"]);
    expect(paths).toEqual(
      [`Symbol(rootpath/<get>)`, `Symbol(rootpath/<set>)`]);
  });

  it("returns the expected nodes for Proxy", () => {
    const nodes = getChildren({
      item: createNode({
        name: "root",
        path: "rootpath",
        contents: { value: gripStubs.get("testProxy")}
      })
    });

    const names = nodes.map(n => n.name);
    const paths = nodes.map(n => n.path.toString());

    expect(names).toEqual(["<target>", "<handler>"]);
    expect(paths).toEqual(
      [`Symbol(rootpath/<target>)`, `Symbol(rootpath/<handler>)`]);
  });

  it("safeGetterValues", () => {
    const stub = performanceStubs.get("timing");
    const root = createNode({
      name: "root",
      path: "rootpath",
      contents: {
        value: {
          actor: "rootactor",
          type: "object"
        }
      }
    });
    const nodes = getChildren({
      item: root,
      loadedProperties: new Map([[root.path, stub]]),
    });

    const nodeEntries = nodes.map(n => [n.name, getValue(n)]);
    const nodePaths = nodes.map(n => n.path.toString());

    const childrenEntries = [
      ["connectEnd", 1500967716401],
      ["connectStart", 1500967716401],
      ["domComplete", 1500967716719],
      ["domContentLoadedEventEnd", 1500967716715],
      ["domContentLoadedEventStart", 1500967716696],
      ["domInteractive", 1500967716552],
      ["domLoading", 1500967716426],
      ["domainLookupEnd", 1500967716401],
      ["domainLookupStart", 1500967716401],
      ["fetchStart", 1500967716401],
      ["loadEventEnd", 1500967716720],
      ["loadEventStart", 1500967716719],
      ["navigationStart", 1500967716401],
      ["redirectEnd", 0],
      ["redirectStart", 0],
      ["requestStart", 1500967716401],
      ["responseEnd", 1500967716401],
      ["responseStart", 1500967716401],
      ["secureConnectionStart", 1500967716401],
      ["unloadEventEnd", 0],
      ["unloadEventStart", 0],
      ["<prototype>", stub.prototype]
    ];
    const childrenPaths = childrenEntries.map(([name]) => `Symbol(rootpath/${name})`);

    expect(nodeEntries).toEqual(childrenEntries);
    expect(nodePaths).toEqual(childrenPaths);
  });

  it("gets data from the cache when it exists", () => {
    const mapNode = createNode({name: "map", contents: {
      value: gripMapStubs.get("testSymbolKeyedMap")
    }});
    const cachedData = Symbol();
    const children = getChildren({
      cachedNodes: new Map([[mapNode.path, cachedData]]),
      item: mapNode,
    });
    expect(children).toBe(cachedData);
  });

  it("returns an empty array if the node does not represent an object", () => {
    const node = createNode({name: "root", contents: {value: 42}});
    expect(getChildren({
      item: node
    })).toEqual([]);
  });

  it("returns an empty array if a grip node has no loaded properties", () => {
    const node = createNode({
      name: "root",
      contents: {value: gripMapStubs.get("testMaxProps")}
    });
    expect(getChildren({
      item: node,
    })).toEqual([]);
  });

  it("adds children to cache when a grip node has loaded properties", () => {
    const stub = performanceStubs.get("timing");
    const cachedNodes = new Map();

    const rootNode = createNode({
      name: "root",
      contents: {
        value: {
          actor: "rootactor",
          type: "object"
        }
      }
    });
    const children = getChildren({
      cachedNodes,
      item: rootNode,
      loadedProperties: new Map([[rootNode.path, stub]]),
    });
    expect(cachedNodes.get(rootNode.path)).toBe(children);
  });

  it("adds children to cache when it already has some", () => {
    const cachedNodes = new Map();
    const children = [Symbol()];
    const rootNode = createNode({name: "root", contents: children});
    getChildren({
      cachedNodes,
      item: rootNode,
    });
    expect(cachedNodes.get(rootNode.path)).toBe(children);
  });

  it("adds children to cache on a node with accessors", () => {
    const cachedNodes = new Map();
    const node = createNode({name: "root", contents: accessorStubs.get("getter setter")});
    const children = getChildren({
      cachedNodes,
      item: node,
    });
    expect(cachedNodes.get(node.path)).toBe(children);
  });

  it("adds children to cache on a map entry node", () => {
    const cachedNodes = new Map();
    const node = createNode({
      name: "root",
      contents: {value: gripMapEntryStubs.get("A → 0")}
    });
    const children = getChildren({
      cachedNodes,
      item: node,
    });
    expect(cachedNodes.get(node.path)).toBe(children);
  });

  it("adds children to cache on a proxy node having loaded props", () => {
    const cachedNodes = new Map();
    const node = createNode({
      name: "root",
      contents: {value: gripStubs.get("testProxy")}
    });
    const children = getChildren({
      cachedNodes,
      item: node,
      loadedProperties: new Map([[node.path, {prototype: {}}]])
    });
    expect(cachedNodes.get(node.path)).toBe(children);
  });

  it("does not adds children to cache on a node with buckets and no loaded props", () => {
    const cachedNodes = new Map();
    const node = createNode({
      name: "root",
      contents: {value: gripArrayStubs.get("Array(234)")}
    });
    getChildren({
      cachedNodes,
      item: node,
    });
    expect(cachedNodes.has(node.path)).toBeFalsy();
  });

  it("adds children to cache on a node with buckets having loaded props", () => {
    const cachedNodes = new Map();
    const node = createNode({
      name: "root",
      contents: {value: gripArrayStubs.get("Array(234)")}
    });
    const children = getChildren({
      cachedNodes,
      item: node,
      loadedProperties: new Map([[node.path, {prototype: {}}]])
    });
    expect(cachedNodes.get(node.path)).toBe(children);
  });
});
