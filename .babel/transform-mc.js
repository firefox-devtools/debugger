const _path = require("path");
const fs = require("fs");

function isRequire(t, node) {
  return node && t.isCallExpression(node) && node.callee.name == "require";
}

module.exports = function({ types: t }) {
  return {
    visitor: {
      ModuleDeclaration(path, state) {
        const source = path.node.source;
        const value = source && source.value;
        if (value && value.includes(".css")) {
          path.remove();
        }
      },

      StringLiteral(path, state) {
        const { mappings, vendors, filePath } = state.opts;
        let value = path.node.value;

        if (!isRequire(t, path.parent)) {
          return;
        }

        // Transform mappings
        if (Object.keys(mappings).includes(value)) {
          path.replaceWith(t.stringLiteral(mappings[value]));
          return;
        }

        // Transform vendors
        if (vendors.includes(value)) {
          path.replaceWith(
            t.stringLiteral("devtools/client/debugger/new/vendors")
          );

          let name = value;
          if (
            path.parentPath &&
            path.parentPath.parent &&
            path.parentPath.parent.id &&
            path.parentPath.parent.id.name
          ) {
            name = path.parentPath.parent.id.name;
          }

          path.parentPath.replaceWith(
            t.memberExpression(path.parent, t.stringLiteral(name), true)
          );
          return;
        }

        const dir = _path.dirname(filePath);
        const depPath = _path.join(dir, `${value}.js`);
        const exists = fs.existsSync(depPath);
        if (
          !exists &&
          !value.endsWith("index") &&
          !value.startsWith("devtools")
        ) {
          path.replaceWith(t.stringLiteral(`${value}/index`));
          return;
        }
      }
    }
  };
};

// const Services = require("Services");
// const devtoolsModules = require("devtools/.../vendors")['devtools-modules']
// const Services = devtoolsModules;
