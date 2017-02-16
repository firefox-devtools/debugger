
let WINDOW_PROPERTIES = {};

if (typeof window == "object") {
  WINDOW_PROPERTIES = Object.getOwnPropertyNames(window);
}

function nodeHasChildren(item) {
  return Array.isArray(item.contents);
}

function nodeIsOptimizedOut(item) {
  return !nodeHasChildren(item) && item.contents.value.optimizedOut === true;
}

function nodeIsMissingArguments(item) {
  return !nodeHasChildren(item) &&
    item.contents.value.missingArguments === true;
}

function nodeHasProperties(item) {
  return !nodeHasChildren(item) && item.contents.value.type === "object";
}

function nodeIsPrimitive(item) {
  return !nodeHasChildren(item) && !nodeHasProperties(item);
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

function makeNodesForProperties(objProps, parentPath) {
  const { ownProperties, prototype } = objProps;

  const nodes = sortProperties(Object.keys(ownProperties))
    .filter(name => {
    // Ignore non-concrete values like getters and setters
    // for now by making sure we have a value.
      return "value" in ownProperties[name];
    }).map(name => {
      return createNode(name, `${parentPath}/${name}`, ownProperties[name]);
    });

  // Add the prototype if it exists and is not null
  if (prototype && prototype.type !== "null") {
    nodes.push(createNode(
      "__proto__",
      `${parentPath}/__proto__`,
      { value: prototype }
    ));
  }

  return nodes;
}

function createNode(name, path, contents) {
  // The path is important to uniquely identify the item in the entire
  // tree. This helps debugging & optimizes React's rendering of large
  // lists. The path will be separated by property name,
  // i.e. `{ foo: { bar: { baz: 5 }}}l` will have a path of `foo/bar/baz`
  // for the inner object.
  return { name, path, contents };
}

module.exports = {
  nodeHasChildren,
  nodeIsOptimizedOut,
  nodeIsMissingArguments,
  nodeHasProperties,
  nodeIsPrimitive,
  isDefault,
  sortProperties,
  makeNodesForProperties,
  createNode
};
