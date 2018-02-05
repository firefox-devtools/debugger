/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

import type { SourceId, Location } from "../../types";
import type { NodePath, Node, Location as BabelLocation } from "babel-traverse";
import { isGeneratedId } from "devtools-source-map";
import getFunctionName from "./utils/getFunctionName";

/**
 * "implicit"
 * Variables added automaticly like "this" and "arguments"
 *
 * "var"
 * Variables declared with "var" or non-block function declarations
 *
 * "let"
 * Variables declared with "let".
 *
 * "const"
 * Variables declared with "const", imported bindings, or added as const
 * bindings like inner function expressions and inner class names.
 */
export type BindingType = "implicit" | "var" | "const" | "let";

export type BindingLocation = {
  start: Location,
  end: Location
};
export type BindingData = {
  type: BindingType,
  declarations: Array<{
    start: Location,
    end: Location
  }>,
  refs: Array<{
    start: Location,
    end: Location
  }>
};
export type ScopeBindingList = {
  [name: string]: BindingData
};

export type SourceScope = {
  type: "object" | "function" | "block",
  displayName: string,
  start: Location,
  end: Location,
  bindings: ScopeBindingList
};

export type ParsedScope = SourceScope & {
  children: ?(ParsedScope[])
};

export type ParseJSScopeVisitor = {
  traverseVisitor: any,
  toParsedScopes: () => ParsedScope[]
};

type TempScope = {
  type: "object" | "function" | "block" | "module",
  displayName: string,
  parent: TempScope | null,
  children: Array<TempScope>,
  loc: BabelLocation,
  names: ScopeBindingList
};

function createTempScope(
  type: "object" | "function" | "block" | "module",
  displayName: string,
  parent: TempScope | null,
  loc: BabelLocation
): TempScope {
  const result = {
    type,
    displayName,
    parent,
    children: [],
    loc,
    names: (Object.create(null): any)
  };
  if (parent) {
    parent.children.push(result);
  }
  return result;
}

function isNode(node?: Node, type: string): boolean {
  return node ? node.type === type : false;
}

function getVarScope(scope: TempScope): TempScope {
  let s = scope;
  while (s.type !== "function" && s.type !== "module") {
    if (!s.parent) {
      return s;
    }
    s = s.parent;
  }
  return s;
}

function fromBabelLocation(
  location: BabelLocation,
  sourceId: SourceId
): Location {
  return {
    sourceId,
    line: location.line,
    column: location.column
  };
}

function parseDeclarator(
  declaratorId: Node,
  targetScope: TempScope,
  type: BindingType
) {
  if (isNode(declaratorId, "Identifier")) {
    let existing = targetScope.names[declaratorId.name];
    if (!existing) {
      existing = {
        type,
        declarations: [],
        refs: []
      };
      targetScope.names[declaratorId.name] = existing;
    }
    existing.declarations.push(declaratorId.loc);
  } else if (isNode(declaratorId, "ObjectPattern")) {
    declaratorId.properties.forEach(prop => {
      parseDeclarator(prop.value, targetScope, type);
    });
  } else if (isNode(declaratorId, "ArrayPattern")) {
    declaratorId.elements.forEach(item => {
      parseDeclarator(item, targetScope, type);
    });
  } else if (isNode(declaratorId, "AssignmentPattern")) {
    parseDeclarator(declaratorId.left, targetScope, type);
  } else if (isNode(declaratorId, "RestElement")) {
    parseDeclarator(declaratorId.argument, targetScope, type);
  }
}

function isLetOrConst(node) {
  return node.kind === "let" || node.kind === "const";
}

function hasLetOrConst(path) {
  return path.node.body.some(node => isLexicalVariable(node));
}
function isLexicalVariable(node) {
  return isNode(node, "VariableDeclaration") && isLetOrConst(node);
}

function findIdentifierInScopes(
  scope: TempScope,
  name: string
): TempScope | null {
  // Find nearest outer scope with the specifed name and add reference.
  for (let s = scope; s; s = s.parent) {
    if (name in s.names) {
      return s;
    }
  }
  return null;
}

function toParsedScopes(
  children: TempScope[],
  sourceId: SourceId
): ?(ParsedScope[]) {
  if (!children || children.length === 0) {
    return undefined;
  }
  return children.map(scope => {
    // Removing unneed information from TempScope such as parent reference.
    // We also need to convert BabelLocation to the Location type.
    const bindings = Object.keys(scope.names).reduce((_bindings, n) => {
      const nameRefs = scope.names[n];

      _bindings[n] = {
        type: nameRefs.type,
        declarations: nameRefs.declarations.map(({ start, end }) => ({
          start: fromBabelLocation(start, sourceId),
          end: fromBabelLocation(end, sourceId)
        })),
        refs: nameRefs.refs.map(({ start, end }) => ({
          start: fromBabelLocation(start, sourceId),
          end: fromBabelLocation(end, sourceId)
        }))
      };
      return _bindings;
    }, ((Object.create(null): any): ScopeBindingList));
    return {
      start: fromBabelLocation(scope.loc.start, sourceId),
      end: fromBabelLocation(scope.loc.end, sourceId),
      type: scope.type === "module" ? "block" : scope.type,
      displayName: scope.displayName,
      bindings: bindings,
      children: toParsedScopes(scope.children, sourceId)
    };
  });
}

/**
 * Creates at visitor for babel-traverse that will parse/extract all bindings
 * information from the source. See also findScopes to perform lookup of the
 * scope information for specific location.
 */
export function createParseJSScopeVisitor(
  sourceId: SourceId
): ParseJSScopeVisitor {
  let parent: TempScope;
  const savedParents: WeakMap<NodePath, TempScope> = new WeakMap();

  let isUnambiguousModule = false;

  const traverseVisitor = {
    // eslint-disable-next-line complexity
    enter(path: NodePath) {
      const tree = path.node;
      const location = path.node.loc;
      if (path.isProgram()) {
        parent = createTempScope("object", "Global", null, location);
        savedParents.set(path, parent);

        // Include fake bindings to collect references to CommonJS
        Object.assign(parent.names, {
          module: {
            type: "var",
            declarations: [],
            refs: []
          },
          exports: {
            type: "var",
            declarations: [],
            refs: []
          },
          __dirname: {
            type: "var",
            declarations: [],
            refs: []
          },
          __filename: {
            type: "var",
            declarations: [],
            refs: []
          },
          require: {
            type: "var",
            declarations: [],
            refs: []
          }
        });

        parent = createTempScope("block", "Lexical Global", parent, location);

        parent = createTempScope("module", "Module", parent, location);
        parent.names.this = {
          type: "implicit",
          declarations: [],
          refs: []
        };
        return;
      }
      if (path.isFunction()) {
        savedParents.set(path, parent);

        if (path.isFunctionExpression() && isNode(tree.id, "Identifier")) {
          parent = createTempScope(
            "block",
            "Function Expression",
            parent,
            location
          );
          parent.names[tree.id.name] = {
            type: "const",
            declarations: [tree.id.loc],
            refs: []
          };
        }

        if (path.isFunctionDeclaration() && isNode(tree.id, "Identifier")) {
          // This ignores Annex B function declaration hoisting, which
          // is probably a fine assumption.
          const fnScope = getVarScope(parent);
          parent.names[tree.id.name] = {
            type: fnScope === parent ? "var" : "let",
            declarations: [tree.id.loc],
            refs: []
          };
        }

        const scope = createTempScope(
          "function",
          getFunctionName(path),
          parent,
          {
            // Being at the start of a function doesn't count as
            // being inside of it.
            start: tree.params[0] ? tree.params[0].loc.start : location.start,
            end: location.end
          }
        );

        tree.params.forEach(param => parseDeclarator(param, scope, "var"));

        if (!path.isArrowFunctionExpression()) {
          scope.names.this = {
            type: "implicit",
            declarations: [],
            refs: []
          };
          scope.names.arguments = {
            type: "implicit",
            declarations: [],
            refs: []
          };
        }

        parent = scope;
        return;
      }
      if (path.isClass()) {
        if (path.isClassDeclaration() && path.get("id").isIdentifier()) {
          parent.names[tree.id.name] = {
            type: "let",
            declarations: [tree.id.loc],
            refs: []
          };
        }

        if (path.get("id").isIdentifier()) {
          savedParents.set(path, parent);
          parent = createTempScope("block", "Class", parent, location);

          parent.names[tree.id.name] = {
            type: "const",
            declarations: [tree.id.loc],
            refs: []
          };
        }
      }
      if (path.isForXStatement() || path.isForStatement()) {
        const init = tree.init || tree.left;
        if (isNode(init, "VariableDeclaration") && isLetOrConst(init)) {
          // Debugger will create new lexical environment for the for.
          savedParents.set(path, parent);
          parent = createTempScope("block", "For", parent, {
            // Being at the start of a for loop doesn't count as
            // being inside it.
            start: init.loc.start,
            end: location.end
          });
        }
        return;
      }
      if (path.isCatchClause()) {
        savedParents.set(path, parent);
        parent = createTempScope("block", "Catch", parent, location);
        parseDeclarator(tree.param, parent, "var");
        return;
      }
      if (path.isBlockStatement()) {
        if (hasLetOrConst(path)) {
          // Debugger will create new lexical environment for the block.
          savedParents.set(path, parent);
          parent = createTempScope("block", "Block", parent, location);
        }
        return;
      }
      if (
        path.isVariableDeclaration() &&
        (path.node.kind === "var" ||
          // Lexical declarations in for statements are handled above.
          !path.parentPath.isForStatement({ init: tree }) ||
          !path.parentPath.isXStatement({ left: tree }))
      ) {
        // Finds right lexical environment
        const hoistAt = !isLetOrConst(tree) ? getVarScope(parent) : parent;
        tree.declarations.forEach(declarator => {
          parseDeclarator(declarator.id, hoistAt, tree.kind);
        });
        return;
      }
      if (path.isImportDeclaration()) {
        isUnambiguousModule = true;

        path.get("specifiers").forEach(spec => {
          parent.names[spec.node.local.name] = {
            type: "const",
            declarations: [spec.node.local.loc],
            refs: []
          };
        });
        return;
      }
      if (path.isExportDeclaration()) {
        isUnambiguousModule = true;
        return;
      }

      if (path.isReferencedIdentifier()) {
        const scope = findIdentifierInScopes(parent, tree.name);
        if (scope) {
          scope.names[tree.name].refs.push(tree.loc);
        }
        return;
      }
      if (path.isThisExpression()) {
        const scope = findIdentifierInScopes(parent, "this");
        if (scope) {
          scope.names.this.refs.push(tree.loc);
        }
      }

      if (path.parentPath.isClassProperty({ value: tree })) {
        savedParents.set(path, parent);
        parent = createTempScope("block", "Class Field", parent, location);
        parent.names.this = {
          type: "implicit",
          declarations: [],
          refs: []
        };
        parent.names.arguments = {
          type: "implicit",
          declarations: [],
          refs: []
        };
        return;
      }

      if (
        path.isSwitchStatement() &&
        path.node.cases.some(node =>
          node.consequent.some(child => isLexicalVariable(child))
        )
      ) {
        savedParents.set(path, parent);
        parent = createTempScope("block", "Switch", parent, location);
        return;
      }
    },
    exit(path: NodePath) {
      const savedParent = savedParents.get(path);
      if (savedParent) {
        parent = savedParent;
        savedParents.delete(path);
      }
    }
  };
  return {
    traverseVisitor,
    toParsedScopes() {
      // TODO: This should probably check for ".mjs" extension on the
      // original file, and should also be skipped if the the generated
      // code is an ES6 module rather than a script.
      if (
        isGeneratedId(sourceId) ||
        (!isUnambiguousModule && !looksLikeCommonJS(parent))
      ) {
        stripModuleScope(parent);
      }

      return toParsedScopes([parent], sourceId) || [];
    }
  };
}

function looksLikeCommonJS(rootScope: TempScope): boolean {
  return (
    rootScope.names.__dirname.refs.length > 0 ||
    rootScope.names.__filename.refs.length > 0 ||
    rootScope.names.require.refs.length > 0 ||
    rootScope.names.exports.refs.length > 0 ||
    rootScope.names.module.refs.length > 0
  );
}

function stripModuleScope(rootScope: TempScope): void {
  const rootLexicalScope = rootScope.children[0];
  const moduleScope = rootLexicalScope.children[0];
  if (moduleScope.type !== "module") {
    throw new Error("Assertion failure - should be module");
  }

  Object.keys(moduleScope.names).forEach(name => {
    const binding = moduleScope.names[name];
    if (binding.type === "let" || binding.type === "const") {
      rootLexicalScope.names[name] = binding;
    } else {
      rootScope.names[name] = binding;
    }
  });
  rootLexicalScope.children = moduleScope.children;
  rootLexicalScope.children.forEach(child => {
    child.parent = rootLexicalScope;
  });
}

function compareLocations(a: Location, b: Location): number {
  // According to type of Location.column can be undefined, if will not be the
  // case here, ignoring flow error.
  // $FlowIgnore
  return a.line == b.line ? a.column - b.column : a.line - b.line;
}

/**
 * Searches all scopes and their bindings at the specific location.
 */
export function findScopes(
  scopes: ParsedScope[],
  location: Location
): SourceScope[] {
  // Find inner most in the tree structure.
  let searchInScopes: ?(ParsedScope[]) = scopes;
  const found = [];
  while (searchInScopes) {
    const foundOne = searchInScopes.some(s => {
      if (
        compareLocations(s.start, location) <= 0 &&
        compareLocations(location, s.end) < 0
      ) {
        // Found the next scope, trying to search recusevly in its children.
        found.unshift(s);
        searchInScopes = s.children;
        return true;
      }
      return false;
    });
    if (!foundOne) {
      break;
    }
  }
  return found.map(i => {
    return {
      type: i.type,
      displayName: i.displayName,
      start: i.start,
      end: i.end,
      bindings: i.bindings
    };
  });
}
