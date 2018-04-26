/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 // @flow

const { maybeEscapePropertyName } = require("../../reps/rep-utils");
const ArrayRep = require("../../reps/array");
const GripArrayRep = require("../../reps/grip-array");
const GripMap = require("../../reps/grip-map");
const GripMapEntryRep = require("../../reps/grip-map-entry");
const ErrorRep = require("../../reps/error");
const { isLongString } = require("../../reps/string");

const MAX_NUMERICAL_PROPERTIES = 100;

const NODE_TYPES = {
  BUCKET: Symbol("[n…m]"),
  DEFAULT_PROPERTIES: Symbol("<default properties>"),
  ENTRIES: Symbol("<entries>"),
  GET: Symbol("<get>"),
  GRIP: Symbol("GRIP"),
  MAP_ENTRY_KEY: Symbol("<key>"),
  MAP_ENTRY_VALUE: Symbol("<value>"),
  PROMISE_REASON: Symbol("<reason>"),
  PROMISE_STATE: Symbol("<state>"),
  PROMISE_VALUE: Symbol("<value>"),
  PROXY_HANDLER: Symbol("<handler>"),
  PROXY_TARGET: Symbol("<target>"),
  SET: Symbol("<set>"),
  PROTOTYPE: Symbol("<prototype>"),
  BLOCK: Symbol("☲"),
};

import type {
  CachedNodes,
  GripProperties,
  LoadedProperties,
  Node,
  NodeContents,
  RdpGrip,
} from "../types";

let WINDOW_PROPERTIES = {};

if (typeof window === "object") {
  WINDOW_PROPERTIES = Object.getOwnPropertyNames(window);
}

function getType(item: Node) : Symbol {
  return item.type;
}

function getValue(
  item: Node
) : RdpGrip | NodeContents {
  if (item && item.contents && item.contents.hasOwnProperty("value")) {
    return item.contents.value;
  }

  if (item && item.contents && item.contents.hasOwnProperty("getterValue")) {
    return item.contents.getterValue;
  }

  if (nodeHasAccessors(item)) {
    return item.contents;
  }

  return undefined;
}

function nodeIsBucket(item: Node) : boolean {
  return getType(item) === NODE_TYPES.BUCKET;
}

function nodeIsEntries(item: Node) : boolean {
  return getType(item) === NODE_TYPES.ENTRIES;
}

function nodeIsMapEntry(item: Node) : boolean {
  return GripMapEntryRep.supportsObject(getValue(item));
}

function nodeHasChildren(item: Node) : boolean {
  return Array.isArray(item.contents);
}

function nodeIsObject(item: Node) : boolean {
  const value = getValue(item);
  return value && value.type === "object";
}

function nodeIsArrayLike(item: Node) : boolean {
  const value = getValue(item);
  return GripArrayRep.supportsObject(value)
    || ArrayRep.supportsObject(value);
}

function nodeIsFunction(item: Node) : boolean {
  const value = getValue(item);
  return value && value.class === "Function";
}

function nodeIsOptimizedOut(item: Node) : boolean {
  const value = getValue(item);
  return !nodeHasChildren(item) && value && value.optimizedOut;
}

function nodeIsUninitializedBinding(item: Node) : boolean {
  const value = getValue(item);
  return value && value.uninitialized;
}

// Used to check if an item represents a binding that exists in a sourcemap's
// original file content, but does not match up with a binding found in the
// generated code.
function nodeIsUnmappedBinding(item: Node) : boolean {
  const value = getValue(item);
  return value && value.unmapped;
}

// Used to check if an item represents a binding that exists in the debugger's
// parser result, but does not match up with a binding returned by the
// debugger server.
function nodeIsUnscopedBinding(item: Node) : boolean {
  const value = getValue(item);
  return value && value.unscoped;
}

function nodeIsMissingArguments(item: Node) : boolean {
  const value = getValue(item);
  return !nodeHasChildren(item) && value && value.missingArguments;
}

function nodeHasProperties(item: Node) : boolean {
  return !nodeHasChildren(item) && nodeIsObject(item);
}

function nodeIsPrimitive(item: Node) : boolean {
  return !nodeHasChildren(item)
    && !nodeHasProperties(item)
    && !nodeIsEntries(item)
    && !nodeIsMapEntry(item)
    && !nodeHasAccessors(item)
    && !nodeIsBucket(item)
    && !nodeIsLongString(item);
}

function nodeIsDefaultProperties(
  item: Node
) : boolean {
  return getType(item) === NODE_TYPES.DEFAULT_PROPERTIES;
}

function isDefaultWindowProperty(name:string) : boolean {
  return WINDOW_PROPERTIES.includes(name);
}

function nodeIsPromise(item: Node) : boolean {
  const value = getValue(item);
  if (!value) {
    return false;
  }

  return value.class == "Promise";
}

function nodeIsProxy(item: Node) : boolean {
  const value = getValue(item);
  if (!value) {
    return false;
  }

  return value.class == "Proxy";
}

function nodeIsPrototype(
  item: Node
) : boolean {
  return getType(item) === NODE_TYPES.PROTOTYPE;
}

function nodeIsWindow(
  item: Node
) : boolean {
  const value = getValue(item);
  if (!value) {
    return false;
  }

  return value.class == "Window";
}

function nodeIsGetter(
  item: Node
) : boolean {
  return getType(item) === NODE_TYPES.GET;
}

function nodeIsSetter(
  item: Node
) : boolean {
  return getType(item) === NODE_TYPES.SET;
}

function nodeIsBlock(
  item: Node
) {
  return getType(item) === NODE_TYPES.BLOCK;
}

function nodeIsError(
  item: Node
) : boolean {
  return ErrorRep.supportsObject(getValue(item));
}

function nodeIsLongString(
  item: Node
) : boolean {
  return isLongString(getValue(item));
}

function nodeHasFullText(
  item: Node
) : boolean {
  const value = getValue(item);
  return nodeIsLongString(item) && value.hasOwnProperty("fullText");
}

function nodeHasAccessors(item: Node) : boolean {
  return !!getNodeGetter(item) || !!getNodeSetter(item);
}

function nodeSupportsNumericalBucketing(item: Node) : boolean {
  // We exclude elements with entries since it's the <entries> node
  // itself that can have buckets.
  return (nodeIsArrayLike(item) && !nodeHasEntries(item))
    || nodeIsEntries(item)
    || nodeIsBucket(item);
}

function nodeHasEntries(
  item : Node
) : boolean {
  const value = getValue(item);
  if (!value) {
    return false;
  }

  return value.class === "Map"
    || value.class === "Set"
    || value.class === "WeakMap"
    || value.class === "WeakSet"
    || value.class === "Storage";
}

function nodeHasAllEntriesInPreview(item : Node) : boolean {
  const { preview } = getValue(item) || {};
  if (!preview) {
    return false;
  }

  const {
    entries,
    items,
    length,
    size,
  } = preview;

  if (!entries && !items) {
    return false;
  }

  return entries
    ? entries.length === size
    : items.length === length;
}

function nodeNeedsNumericalBuckets(item : Node) : boolean {
  return nodeSupportsNumericalBucketing(item)
    && getNumericalPropertiesCount(item) > MAX_NUMERICAL_PROPERTIES;
}

function makeNodesForPromiseProperties(
  item: Node
) : Array<Node> {
  const { promiseState: { reason, value, state } } = getValue(item);

  const properties = [];

  if (state) {
    properties.push(
      createNode({
        parent: item,
        name: "<state>",
        contents: { value: state },
        type: NODE_TYPES.PROMISE_STATE
      })
    );
  }

  if (reason) {
    properties.push(
      createNode({
        parent: item,
        name: "<reason>",
        contents: { value: reason },
        type: NODE_TYPES.PROMISE_REASON
      })
    );
  }

  if (value) {
    properties.push(
      createNode({
        parent: item,
        name: "<value>",
        contents: { value: value },
        type: NODE_TYPES.PROMISE_VALUE
      })
    );
  }

  return properties;
}

function makeNodesForProxyProperties(
  item: Node
) : Array<Node> {
  const {
    proxyHandler,
    proxyTarget,
  } = getValue(item);

  return [
    createNode({
      parent: item,
      name: "<target>",
      contents: { value: proxyTarget },
      type: NODE_TYPES.PROXY_TARGET
    }),
    createNode({
      parent: item,
      name: "<handler>",
      contents: { value: proxyHandler },
      type: NODE_TYPES.PROXY_HANDLER
    }),
  ];
}

function makeNodesForEntries(
  item : Node
) : Node {
  const nodeName = "<entries>";
  const entriesPath = "<entries>";

  if (nodeHasAllEntriesInPreview(item)) {
    let entriesNodes = [];
    const { preview } = getValue(item);
    if (preview.entries) {
      entriesNodes = preview.entries.map(([key, value], index) => {
        return createNode({
          parent: item,
          name: index,
          path: `${entriesPath}/${index}`,
          contents: { value: GripMapEntryRep.createGripMapEntry(key, value) }
        });
      });
    } else if (preview.items) {
      entriesNodes = preview.items.map((value, index) => {
        return createNode({
          parent: item,
          name: index,
          path: `${entriesPath}/${index}`,
          contents: {value}
        });
      });
    }
    return createNode({
      parent: item,
      name: nodeName,
      contents: entriesNodes,
      type: NODE_TYPES.ENTRIES
    });
  }
  return createNode({
    parent: item,
    name: nodeName,
    contents: null,
    type: NODE_TYPES.ENTRIES
  });
}

function makeNodesForMapEntry(
  item: Node
) : Array<Node> {
  const nodeValue = getValue(item);
  if (!nodeValue || !nodeValue.preview) {
    return [];
  }

  const {key, value} = nodeValue.preview;

  return [
    createNode({
      parent: item,
      name: "<key>",
      contents: {value: key},
      type: NODE_TYPES.MAP_ENTRY_KEY
    }),
    createNode({
      parent: item,
      name: "<value>",
      contents: {value},
      type: NODE_TYPES.MAP_ENTRY_VALUE
    }),
  ];
}

function getNodeGetter(item: Node): ?Object {
  return item && item.contents
    ? item.contents.get
    : undefined;
}

function getNodeSetter(item: Node): ?Object {
  return item && item.contents
    ? item.contents.set
    : undefined;
}

function makeNodesForAccessors(item: Node) : Array<Node> {
  const accessors = [];

  const getter = getNodeGetter(item);
  if (getter && getter.type !== "undefined") {
    accessors.push(createNode({
      parent: item,
      name: "<get>",
      contents: { value: getter },
      type: NODE_TYPES.GET
    }));
  }

  const setter = getNodeSetter(item);
  if (setter && setter.type !== "undefined") {
    accessors.push(createNode({
      parent: item,
      name: "<set>",
      contents: { value: setter },
      type: NODE_TYPES.SET
    }));
  }

  return accessors;
}

function sortProperties(properties: Array<any>) : Array<any> {
  return properties.sort((a, b) => {
    // Sort numbers in ascending order and sort strings lexicographically
    const aInt = parseInt(a, 10);
    const bInt = parseInt(b, 10);

    if (isNaN(aInt) || isNaN(bInt)) {
      return a > b ? 1 : -1;
    }

    return aInt - bInt;
  });
}

function makeNumericalBuckets(
  parent: Node
) : Array<Node> {
  const numProperties = getNumericalPropertiesCount(parent);

  // We want to have at most a hundred slices.
  const bucketSize = 10 ** Math.max(2, Math.ceil(Math.log10(numProperties)) - 2);
  const numBuckets = Math.ceil(numProperties / bucketSize);

  let buckets = [];
  for (let i = 1; i <= numBuckets; i++) {
    const minKey = (i - 1) * bucketSize;
    const maxKey = Math.min(i * bucketSize - 1, numProperties - 1);
    const startIndex = nodeIsBucket(parent) ? parent.meta.startIndex : 0;
    const minIndex = startIndex + minKey;
    const maxIndex = startIndex + maxKey;
    const bucketName = `[${minIndex}…${maxIndex}]`;

    buckets.push(createNode({
      parent,
      name: bucketName,
      contents: null,
      type: NODE_TYPES.BUCKET,
      meta: {
        startIndex: minIndex,
        endIndex: maxIndex,
      }
    }));
  }
  return buckets;
}

function makeDefaultPropsBucket(
  propertiesNames: Array<string>,
  parent: Node,
  ownProperties: Object
) : Array<Node> {
  const userPropertiesNames = [];
  const defaultProperties = [];

  propertiesNames.forEach(name => {
    if (isDefaultWindowProperty(name)) {
      defaultProperties.push(name);
    } else {
      userPropertiesNames.push(name);
    }
  });

  let nodes = makeNodesForOwnProps(userPropertiesNames, parent, ownProperties);

  if (defaultProperties.length > 0) {
    const defaultPropertiesNode = createNode({
      parent,
      name: "<default properties>",
      contents: null,
      type: NODE_TYPES.DEFAULT_PROPERTIES
    });

    const defaultNodes = defaultProperties.map((name, index) =>
      createNode({
        parent: defaultPropertiesNode,
        name: maybeEscapePropertyName(name),
        path: `${index}/${name}`,
        contents: ownProperties[name]
      })
    );
    nodes.push(
      setNodeChildren(defaultPropertiesNode, defaultNodes)
    );
  }
  return nodes;
}

function makeNodesForOwnProps(
  propertiesNames: Array<string>,
  parent: Node,
  ownProperties: Object
) : Array<Node> {
  return propertiesNames.map(name =>
    createNode({
      parent,
      name: maybeEscapePropertyName(name),
      contents: ownProperties[name]
    })
  );
}

function makeNodesForProperties(
  objProps: GripProperties,
  parent: Node
) : Array<Node> {
  const {
    ownProperties = {},
    ownSymbols,
    prototype,
    safeGetterValues,
  } = objProps;

  const parentValue = getValue(parent);

  let allProperties = {...ownProperties, ...safeGetterValues};

  // Ignore properties that are neither non-concrete nor getters/setters.
  const propertiesNames = sortProperties(Object.keys(allProperties)).filter(name => {
    if (!allProperties[name]) {
      return false;
    }

    const properties = Object.getOwnPropertyNames(allProperties[name]);
    return properties
      .some(property => ["value", "getterValue", "get", "set"].includes(property));
  });

  let nodes = [];
  if (parentValue && parentValue.class == "Window") {
    nodes = makeDefaultPropsBucket(propertiesNames, parent, allProperties);
  } else {
    nodes = makeNodesForOwnProps(propertiesNames, parent, allProperties);
  }

  if (Array.isArray(ownSymbols)) {
    ownSymbols.forEach((ownSymbol, index) => {
      nodes.push(
        createNode({
          parent,
          name: ownSymbol.name,
          path: `symbol-${index}`,
          contents: ownSymbol.descriptor || null
        })
      );
    }, this);
  }

  if (nodeIsPromise(parent)) {
    nodes.push(...makeNodesForPromiseProperties(parent));
  }

  if (nodeHasEntries(parent)) {
    nodes.push(makeNodesForEntries(parent));
  }

  // Add the prototype if it exists and is not null
  if (prototype && prototype.type !== "null") {
    nodes.push(makeNodeForPrototype(objProps, parent));
  }

  return nodes;
}

function setNodeFullText(
  loadedProps: GripProperties,
  node: Node
) : Node {
  if (nodeHasFullText(node)) {
    return node;
  }

  if (nodeIsLongString(node)) {
    node.contents.value.fullText = loadedProps.fullText;
  }

  return node;
}

function makeNodeForPrototype(
  objProps: GripProperties,
  parent: Node
) : ?Node {
  const {
    prototype,
  } = objProps || {};

  // Add the prototype if it exists and is not null
  if (prototype && prototype.type !== "null") {
    return createNode({
      parent,
      name: "<prototype>",
      contents: { value: prototype },
      type: NODE_TYPES.PROTOTYPE
    });
  }

  return null;
}

function createNode(options : {
  parent: Node,
  name: string,
  contents: any,
  path?: string,
  type?: Symbol,
  meta?: Object
}) : ?Node {
  const {
    parent,
    name,
    path,
    contents,
    type = NODE_TYPES.GRIP,
    meta,
  } = options;

  if (contents === undefined) {
    return null;
  }

  // The path is important to uniquely identify the item in the entire
  // tree. This helps debugging & optimizes React's rendering of large
  // lists. The path will be separated by property name, wrapped in a Symbol to avoid
  // name clashing,
  // i.e. `{ foo: { bar: { baz: 5 }}}` will have a path of Symbol(`foo/bar/baz`)
  // for the inner object.
  return {
    parent,
    name,
    path: parent
      ? Symbol(`${getSymbolDescriptor(parent.path)}/${path || name}`)
      : Symbol(path || name),
    contents,
    type,
    meta,
  };
}

function getSymbolDescriptor(symbol: Symbol | string) : string {
  return symbol.toString().replace(/^(Symbol\()(.*)(\))$/, "$2");
}

function setNodeChildren(
  node: Node,
  children: Array<Node>
) : Node {
  node.contents = children;
  return node;
}

function getChildren(options: {
  cachedNodes: CachedNodes,
  loadedProperties: LoadedProperties,
  item: Node
}) : Array<Node> {
  const {
    cachedNodes,
    loadedProperties = new Map(),
    item,
  } = options;

  const key = item.path;
  if (cachedNodes && cachedNodes.has(key)) {
    return cachedNodes.get(key);
  }

  const loadedProps = loadedProperties.get(key);
  const hasLoadedProps = loadedProperties.has(key);

  // Because we are dynamically creating the tree as the user
  // expands it (not precalculated tree structure), we cache child
  // arrays. This not only helps performance, but is necessary
  // because the expanded state depends on instances of nodes
  // being the same across renders. If we didn't do this, each
  // node would be a new instance every render.
  // If the node needs properties, we only add children to
  // the cache if the properties are loaded.
  const addToCache = (children: Array<Node>) => {
    if (cachedNodes) {
      cachedNodes.set(item.path, children);
    }
    return children;
  };

  // Nodes can either have children already, or be an object with
  // properties that we need to go and fetch.
  if (nodeHasChildren(item)) {
    return addToCache(item.contents);
  }

  if (nodeHasAccessors(item)) {
    return addToCache(makeNodesForAccessors(item));
  }

  if (nodeIsMapEntry(item)) {
    return addToCache(makeNodesForMapEntry(item));
  }

  if (nodeIsProxy(item)) {
    return addToCache(makeNodesForProxyProperties(item));
  }

  if (nodeIsLongString(item) && hasLoadedProps) {
    // Set longString object's fullText to fetched one.
    return addToCache(setNodeFullText(loadedProps, item));
  }

  if (nodeNeedsNumericalBuckets(item) && hasLoadedProps) {
    // Even if we have numerical buckets, we should have loaded non indexed properties,
    const bucketNodes = makeNumericalBuckets(item);
    return addToCache(bucketNodes.concat(makeNodesForProperties(loadedProps, item)));
  }

  if (!nodeIsEntries(item) && !nodeIsBucket(item) && !nodeHasProperties(item)) {
    return [];
  }

  if (!hasLoadedProps) {
    return [];
  }

  return addToCache(makeNodesForProperties(loadedProps, item));
}

function getParent(item: Node) : Node | null {
  return item.parent;
}

function getNumericalPropertiesCount(item: Node) : number {
  if (nodeIsBucket(item)) {
    return item.meta.endIndex - item.meta.startIndex + 1;
  }

  const value = getValue(getClosestGripNode(item));
  if (!value) {
    return 0;
  }

  if (GripArrayRep.supportsObject(value)) {
    return GripArrayRep.getLength(value);
  }

  if (GripMap.supportsObject(value)) {
    return GripMap.getLength(value);
  }

  // TODO: We can also have numerical properties on Objects, but at the
  // moment we don't have a way to distinguish them from non-indexed properties,
  // as they are all computed in a ownPropertiesLength property.

  return 0;
}

function getClosestGripNode(item: Node) : Node | null {
  const type = getType(item);
  if (
    type !== NODE_TYPES.BUCKET
    && type !== NODE_TYPES.DEFAULT_PROPERTIES
    && type !== NODE_TYPES.ENTRIES
  ) {
    return item;
  }

  const parent = getParent(item);
  if (!parent) {
    return null;
  }

  return getClosestGripNode(parent);
}

function getClosestNonBucketNode(item: Node) : Node | null {
  const type = getType(item);

  if (type !== NODE_TYPES.BUCKET) {
    return item;
  }

  const parent = getParent(item);
  if (!parent) {
    return null;
  }

  return getClosestNonBucketNode(parent);
}

module.exports = {
  createNode,
  getChildren,
  getClosestGripNode,
  getClosestNonBucketNode,
  getParent,
  getNumericalPropertiesCount,
  getValue,
  makeNodesForEntries,
  makeNodesForPromiseProperties,
  makeNodesForProperties,
  makeNumericalBuckets,
  nodeHasAccessors,
  nodeHasAllEntriesInPreview,
  nodeHasChildren,
  nodeHasEntries,
  nodeHasProperties,
  nodeIsBlock,
  nodeIsBucket,
  nodeIsDefaultProperties,
  nodeIsEntries,
  nodeIsError,
  nodeIsLongString,
  nodeHasFullText,
  nodeIsFunction,
  nodeIsGetter,
  nodeIsMapEntry,
  nodeIsMissingArguments,
  nodeIsObject,
  nodeIsOptimizedOut,
  nodeIsPrimitive,
  nodeIsPromise,
  nodeIsPrototype,
  nodeIsProxy,
  nodeIsSetter,
  nodeIsUninitializedBinding,
  nodeIsUnmappedBinding,
  nodeIsUnscopedBinding,
  nodeIsWindow,
  nodeNeedsNumericalBuckets,
  nodeSupportsNumericalBucketing,
  setNodeChildren,
  sortProperties,
  NODE_TYPES,
};
