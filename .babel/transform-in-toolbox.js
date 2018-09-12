/**
 * This Babel plugin is used to remove any `inToolbox` function that might exist
 * and replace calls to them by `true`. This should only be used when creating
 * bundles for mozilla-central.
 */
module.exports = function() {
  return {
    visitor: {
      FunctionDeclaration(path) {
        if (path.node.id.name === "inToolbox") {
          path.remove();
        }
      },

      CallExpression(path) {
        const calleePath = path.get("callee");
        if (calleePath.node.name === "inToolbox") {
          path.replaceWithSourceString(`true`);
        }
      },

    }
  };
};
