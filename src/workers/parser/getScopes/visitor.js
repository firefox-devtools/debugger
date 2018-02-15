/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

import isEmpty from "lodash/isEmpty";
import type { SourceId, Location } from "../../../types";
import type { Node, Location as BabelLocation } from "@babel/traverse";
import * as t from "@babel/types";
import type { BabelNode, TraversalAncestors } from "@babel/types";
import { isGeneratedId } from "devtools-source-map";
import getFunctionName from "../utils/getFunctionName";
import { getAst } from "../utils/ast";

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
 * Variables declared with "const", or added as const
 * bindings like inner function expressions and inner class names.
 *
 * "import"
 * Imported binding names exposed from other modules.
 */
export type BindingType = "implicit" | "var" | "const" | "let" | "import";

export type BindingLocation = {
  start: Location,
  end: Location,
  +meta?: BindingMetaValue | null
};
export type BindingData = {
  type: BindingType,
  declarations: Array<BindingLocation>,
  refs: Array<BindingLocation>
};

// Location information about the expression immediartely surrounding a
// given binding reference.
export type BindingMetaValue =
  | {
      type: "inherit",
      start: Location,
      end: Location,
      parent: BindingMetaValue | null
    }
  | {
      type: "call",
      start: Location,
      end: Location,
      parent: BindingMetaValue | null
    }
  | {
      type: "member",
      start: Location,
      end: Location,
      property: string,
      parent: BindingMetaValue | null
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

type ScopeCollectionVisitorState = {
  sourceId: SourceId,
  parent: TempScope,
  isUnambiguousModule: boolean,
  savedParents: WeakMap<Node, TempScope>
};

export function parseSourceScopes(sourceId: SourceId): ?Array<ParsedScope> {
  const ast = getAst(sourceId);
  if (isEmpty(ast)) {
    return null;
  }

  const { global, lexical } = createGlobalScope(ast);

  const state = {
    sourceId,
    parent: lexical,
    isUnambiguousModule: false,
    savedParents: new WeakMap()
  };
  t.traverse(ast, scopeCollectionVisitor, state);

  // TODO: This should probably check for ".mjs" extension on the
  // original file, and should also be skipped if the the generated
  // code is an ES6 module rather than a script.
  if (
    isGeneratedId(sourceId) ||
    (!state.isUnambiguousModule && !looksLikeCommonJS(global))
  ) {
    stripModuleScope(global);
  }

  return toParsedScopes([global], sourceId) || [];
}

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

function hasLexicalDeclaration(node, parent) {
  const isFunctionBody = t.isFunction(parent, { body: node });

  return node.body.some(
    child =>
      isLexicalVariable(child) ||
      (!isFunctionBody && child.type === "FunctionDeclaration") ||
      child.type === "ClassDeclaration"
  );
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
        refs: nameRefs.refs.map(({ start, end, meta }) => ({
          start: fromBabelLocation(start, sourceId),
          end: fromBabelLocation(end, sourceId),
          // eslint-disable-next-line max-nested-callbacks
          meta: mapMeta(meta || null, item => {
            // $FlowIgnore - Flow doesn't like merging here.
            return {
              ...item,
              start: fromBabelLocation(item.start, sourceId),
              end: fromBabelLocation(item.end, sourceId)
            };
          })
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

function mapMeta(
  item: BindingMetaValue | null,
  callback: BindingMetaValue => BindingMetaValue
): BindingMetaValue | null {
  if (!item) {
    return null;
  }

  const result = callback(item);

  // $FlowIgnore - Flow doesn't like merging here.
  return {
    ...result,
    parent: mapMeta(item.parent, callback)
  };
}

function createGlobalScope(
  ast: BabelNode
): { global: TempScope, lexical: TempScope } {
  const global = createTempScope("object", "Global", null, ast.loc);

  // Include fake bindings to collect references to CommonJS
  Object.assign(global.names, {
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

  const lexical = createTempScope("block", "Lexical Global", global, ast.loc);

  return {
    global,
    lexical
  };
}

const scopeCollectionVisitor = {
  // eslint-disable-next-line complexity
  enter(
    node: BabelNode,
    ancestors: TraversalAncestors,
    state: ScopeCollectionVisitorState
  ) {
    const parentNode =
      ancestors.length === 0 ? null : ancestors[ancestors.length - 1].node;

    let parent = state.parent;
    const location = node.loc;
    if (t.isProgram(node)) {
      state.savedParents.set(node, parent);
      parent = state.parent = createTempScope(
        "module",
        "Module",
        parent,
        location
      );
      parent.names.this = {
        type: "implicit",
        declarations: [],
        refs: []
      };
      return;
    }
    if (t.isFunction(node)) {
      state.savedParents.set(node, parent);

      if (t.isFunctionExpression(node) && isNode(node.id, "Identifier")) {
        parent = state.parent = createTempScope(
          "block",
          "Function Expression",
          parent,
          location
        );
        parent.names[node.id.name] = {
          type: "const",
          declarations: [node.id.loc],
          refs: []
        };
      }

      if (t.isFunctionDeclaration(node) && isNode(node.id, "Identifier")) {
        // This ignores Annex B function declaration hoisting, which
        // is probably a fine assumption.
        const fnScope = getVarScope(parent);
        parent.names[node.id.name] = {
          type: fnScope === parent ? "var" : "let",
          declarations: [node.id.loc],
          refs: []
        };
      }

      const scope = (state.parent = createTempScope(
        "function",
        getFunctionName(node, parentNode),
        parent,
        {
          // Being at the start of a function doesn't count as
          // being inside of it.
          start: node.params[0] ? node.params[0].loc.start : location.start,
          end: location.end
        }
      ));

      node.params.forEach(param => parseDeclarator(param, scope, "var"));

      if (!t.isArrowFunctionExpression(node)) {
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
    if (t.isClass(node)) {
      if (t.isClassDeclaration(node) && t.isIdentifier(node.id)) {
        parent.names[node.id.name] = {
          type: "let",
          declarations: [node.id.loc],
          refs: []
        };
      }

      if (t.isIdentifier(node.id)) {
        state.savedParents.set(node, parent);
        parent = state.parent = createTempScope(
          "block",
          "Class",
          parent,
          location
        );

        parent.names[node.id.name] = {
          type: "const",
          declarations: [node.id.loc],
          refs: []
        };
      }
    }
    if (t.isForXStatement(node) || t.isForStatement(node)) {
      const init = node.init || node.left;
      if (isNode(init, "VariableDeclaration") && isLetOrConst(init)) {
        // Debugger will create new lexical environment for the for.
        state.savedParents.set(node, parent);
        parent = state.parent = createTempScope("block", "For", parent, {
          // Being at the start of a for loop doesn't count as
          // being inside it.
          start: init.loc.start,
          end: location.end
        });
      }
      return;
    }
    if (t.isCatchClause(node)) {
      state.savedParents.set(node, parent);
      parent = state.parent = createTempScope(
        "block",
        "Catch",
        parent,
        location
      );
      parseDeclarator(node.param, parent, "var");
      return;
    }
    if (t.isBlockStatement(node)) {
      if (hasLexicalDeclaration(node, parentNode)) {
        // Debugger will create new lexical environment for the block.
        state.savedParents.set(node, parent);
        parent = state.parent = createTempScope(
          "block",
          "Block",
          parent,
          location
        );
      }
      return;
    }
    if (
      t.isVariableDeclaration(node) &&
      (node.kind === "var" ||
        // Lexical declarations in for statements are handled above.
        !t.isForStatement(parentNode, { init: node }) ||
        !t.isForXStatement(parentNode, { left: node }))
    ) {
      // Finds right lexical environment
      const hoistAt = !isLetOrConst(node) ? getVarScope(parent) : parent;
      node.declarations.forEach(declarator => {
        parseDeclarator(declarator.id, hoistAt, node.kind);
      });
      return;
    }
    if (t.isImportDeclaration(node)) {
      state.isUnambiguousModule = true;

      node.specifiers.forEach(spec => {
        parent.names[spec.local.name] = {
          // Imported namespaces aren't live import bindings, they are
          // just normal const bindings.
          type: t.isImportNamespaceSpecifier(spec) ? "const" : "import",
          declarations: [spec.local.loc],
          refs: []
        };
      });
      return;
    }
    if (t.isExportDeclaration(node)) {
      state.isUnambiguousModule = true;
      return;
    }

    if (t.isIdentifier(node) && t.isReferenced(node, parentNode)) {
      const scope = findIdentifierInScopes(parent, node.name);
      if (scope) {
        scope.names[node.name].refs.push({
          start: node.loc.start,
          end: node.loc.end,
          meta: buildMetaBindings(node, ancestors)
        });
      }
      return;
    }
    if (t.isThisExpression(node)) {
      const scope = findIdentifierInScopes(parent, "this");
      if (scope) {
        scope.names.this.refs.push({
          start: node.loc.start,
          end: node.loc.end,
          meta: buildMetaBindings(node, ancestors)
        });
      }
    }

    if (t.isClassProperty(parentNode, { value: node })) {
      state.savedParents.set(node, parent);
      parent = state.parent = createTempScope(
        "function",
        "Class Field",
        parent,
        location
      );
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
      t.isSwitchStatement(node) &&
      node.cases.some(caseNode =>
        caseNode.consequent.some(child => isLexicalVariable(child))
      )
    ) {
      state.savedParents.set(node, parent);
      parent = state.parent = createTempScope(
        "block",
        "Switch",
        parent,
        location
      );
      return;
    }
  },
  exit(
    node: BabelNode,
    ancestors: TraversalAncestors,
    state: ScopeCollectionVisitorState
  ) {
    const savedParent = state.savedParents.get(node);
    if (savedParent) {
      state.parent = savedParent;
      state.savedParents.delete(node);
    }
  }
};

function buildMetaBindings(
  node: BabelNode,
  ancestors: TraversalAncestors,
  parentIndex: number = ancestors.length - 1
): BindingMetaValue | null {
  if (parentIndex <= 1) {
    return null;
  }
  const parent = ancestors[parentIndex].node;
  const grandparent = ancestors[parentIndex - 1].node;

  // Consider "0, foo" to be equivalent to "foo".
  if (
    t.isSequenceExpression(parent) &&
    parent.expressions.length === 2 &&
    t.isNumericLiteral(parent.expressions[0]) &&
    parent.expressions[1] === node
  ) {
    let start = parent.loc.start;
    let end = parent.loc.end;

    if (t.isCallExpression(grandparent, { callee: parent })) {
      // Attempt to expand the range around parentheses, e.g.
      // (0, foo.bar)()
      start = grandparent.loc.start;
      end = Object.assign({}, end);
      end.column += 1;
    }

    return {
      type: "inherit",
      start,
      end,
      parent: buildMetaBindings(parent, ancestors, parentIndex - 1)
    };
  }

  // Consider "Object(foo)" to be equivalent to "foo"
  if (
    t.isCallExpression(parent) &&
    t.isIdentifier(parent.callee, { name: "Object" }) &&
    parent.arguments.length === 1 &&
    parent.arguments[0] === node
  ) {
    return {
      type: "inherit",
      start: parent.loc.start,
      end: parent.loc.end,
      parent: buildMetaBindings(parent, ancestors, parentIndex - 1)
    };
  }

  if (t.isMemberExpression(parent, { object: node })) {
    if (parent.computed) {
      if (t.isStringLiteral(parent.property)) {
        return {
          type: "member",
          start: parent.loc.start,
          end: parent.loc.end,
          property: parent.property.value,
          parent: buildMetaBindings(parent, ancestors, parentIndex - 1)
        };
      }
    } else {
      return {
        type: "member",
        start: parent.loc.start,
        end: parent.loc.end,
        property: parent.property.name,
        parent: buildMetaBindings(parent, ancestors, parentIndex - 1)
      };
    }
  }
  if (
    t.isCallExpression(parent, { callee: node }) &&
    parent.arguments.length == 0
  ) {
    return {
      type: "call",
      start: parent.loc.start,
      end: parent.loc.end,
      parent: buildMetaBindings(parent, ancestors, parentIndex - 1)
    };
  }

  return null;
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
