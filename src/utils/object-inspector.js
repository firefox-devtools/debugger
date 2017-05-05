const get = require("lodash/get");
const { maybeEscapePropertyName } = require("devtools-reps");

let WINDOW_PROPERTIES = {};

if (typeof window == "object") {
  WINDOW_PROPERTIES = Object.getOwnPropertyNames(window);
}

function getValue(item) {
  return get(item, "contents.value", undefined);
}

function isBucket(item) {
  return item.path && item.path.match(/bucket(\d+)$/);
}

function nodeHasChildren(item) {
  return Array.isArray(item.contents) || isBucket(item);
}

function nodeIsObject(item) {
  const value = getValue(item);
  return value && value.type === "object";
}

function nodeIsArray(value) {
  return value && value.class === "Array";
}

function nodeIsFunction(item) {
  const value = getValue(item);
  return value && value.class === "Function";
}

function nodeIsOptimizedOut(item) {
  const value = getValue(item);
  return !nodeHasChildren(item) && value && value.optimizedOut;
}

function nodeIsMissingArguments(item) {
  const value = getValue(item);
  return !nodeHasChildren(item) && value && value.missingArguments;
}

function nodeHasProperties(item) {
  return !nodeHasChildren(item) && nodeIsObject(item);
}

function nodeIsPrimitive(item) {
  return !nodeHasChildren(item) && !nodeHasProperties(item);
}

function isPromise(item) {
  const value = getValue(item);
  return value.class == "Promise";
}

function getPromiseProperties(item) {
  const { promiseState: { reason, value } } = getValue(item);
  return createNode("reason", `${item.path}/reason`, {
    value: !reason ? value : reason
  });
}

function isDefault(item) {
  return WINDOW_PROPERTIES.includes(item.name);
}

function sortProperties(properties) {
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

function makeNumericalBuckets(props, bucketSize, parentPath, ownProperties) {
  const numProperties = props.length;
  const numBuckets = Math.ceil(numProperties / bucketSize);
  let buckets = [];
  for (let i = 1; i <= numBuckets; i++) {
    const bucketKey = `bucket${i}`;
    const minKey = (i - 1) * bucketSize;
    const maxKey = Math.min(i * bucketSize - 1, numProperties);
    const bucketName = `[${minKey}..${maxKey}]`;
    const bucketProperties = props.slice(minKey, maxKey);

    const bucketNodes = bucketProperties.map(name =>
      createNode(
        name,
        `${parentPath}/${bucketKey}/${name}`,
        ownProperties[name]
      )
    );

    buckets.push(
      createNode(bucketName, `${parentPath}/${bucketKey}`, bucketNodes)
    );
  }
  return buckets;
}

function makeDefaultPropsBucket(props, parentPath, ownProperties) {
  const userProps = props.filter(name => !isDefault({ name }));
  const defaultProps = props.filter(name => isDefault({ name }));

  let nodes = userProps.map(name =>
    createNode(
      maybeEscapePropertyName(name),
      `${parentPath}/${name}`,
      ownProperties[name]
    )
  );

  if (defaultProps.length > 0) {
    const defaultNodes = defaultProps.map((name, index) =>
      createNode(
        maybeEscapePropertyName(name),
        `${parentPath}/bucket${index}/${name}`,
        ownProperties[name]
      )
    );
    nodes.push(
      createNode("[default properties]", `${parentPath}/default`, defaultNodes)
    );
  }
  return nodes;
}

/*

 * Ignore non-concrete values like getters and setters
 * for now by making sure we have a value.
*/
function makeNodesForProperties(
  objProps,
  parentPath,
  { bucketSize = 100 } = {}
) {
  const { ownProperties, prototype, ownSymbols } = objProps;

  const properties = sortProperties(Object.keys(ownProperties)).filter(name =>
    ownProperties[name].hasOwnProperty("value")
  );

  const numProperties = properties.length;

  let nodes = [];
  if (nodeIsArray(prototype) && numProperties > bucketSize) {
    nodes = makeNumericalBuckets(
      properties,
      bucketSize,
      parentPath,
      ownProperties
    );
  } else {
    nodes = makeDefaultPropsBucket(properties, parentPath, ownProperties);
  }

  for (let index in ownSymbols) {
    nodes.push(
      createNode(
        ownSymbols[index].name,
        `${parentPath}/##symbol-${index}`,
        ownSymbols[index].descriptor
      )
    );
  }

  // Add the prototype if it exists and is not null
  if (prototype && prototype.type !== "null") {
    nodes.push(
      createNode("__proto__", `${parentPath}/__proto__`, { value: prototype })
    );
  }

  return nodes;
}

function createNode(name, path, contents) {
  // The path is important to uniquely identify the item in the entire
  // tree. This helps debugging & optimizes React's rendering of large
  // lists. The path will be separated by property name,
  // i.e. `{ foo: { bar: { baz: 5 }}}` will have a path of `foo/bar/baz`
  // for the inner object.
  return { name, path, contents };
}

function getChildren({ getObjectProperties, actors, item }) {
  const obj = item.contents;

  // Nodes can either have children already, or be an object with
  // properties that we need to go and fetch.
  if (nodeHasChildren(item)) {
    return item.contents;
  }

  if (!nodeHasProperties(item)) {
    return [];
  }

  const actor = obj.value.actor;

  // Because we are dynamically creating the tree as the user
  // expands it (not precalcuated tree structure), we cache child
  // arrays. This not only helps performance, but is necessary
  // because the expanded state depends on instances of nodes
  // being the same across renders. If we didn't do this, each
  // node would be a new instance every render.
  const key = item.path;
  if (actors && actors[key]) {
    return actors[key];
  }

  if (isBucket(item)) {
    return item.contents.children;
  }

  const loadedProps = getObjectProperties(actor);
  const { ownProperties, prototype } = loadedProps || {};

  if (!ownProperties && !prototype) {
    return [];
  }

  let children = makeNodesForProperties(loadedProps, item.path);
  if (isPromise(item)) {
    children.unshift(getPromiseProperties(item));
  }
  actors[key] = children;
  return children;
}

module.exports = {
  nodeHasChildren,
  nodeIsOptimizedOut,
  nodeIsMissingArguments,
  nodeHasProperties,
  nodeIsPrimitive,
  nodeIsObject,
  nodeIsFunction,
  isDefault,
  sortProperties,
  makeNodesForProperties,
  getChildren,
  createNode,
  isPromise,
  getPromiseProperties
};
