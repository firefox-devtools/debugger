/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

import type { SourceId, Location } from "debugger-html";
import type { NodePath, Node, Location as BabelLocation } from "babel-traverse";

export type SourceScope = {
  type: string,
  start: Location,
  end: Location,
  bindings: {
    [name: string]: Location[]
  }
};

export type ParsedScopeNamesReferences = {
  [name: string]: Location[]
};

export type ParsedScope = {
  start: Location,
  end: Location,
  type: string,
  bindings: ParsedScopeNamesReferences,
  children: ?(ParsedScope[])
};

export type ParseJSScopeVisitor = {
  traverseVisitor: any,
  toParsedScopes: () => ParsedScope[]
};

type TempScopeNameReferences = {
  type: string,
  refs: BabelLocation[]
};

type TempScopeNamesReferences = {
  [name: string]: TempScopeNameReferences
};

type TempScope = {
  type: string,
  parent: TempScope | null,
  children: Array<TempScope>,
  loc: BabelLocation,
  names: TempScopeNamesReferences
};

function createTempScope(
  type: string,
  parent: TempScope | null,
  loc: BabelLocation
): TempScope {
  const result = {
    type,
    parent,
    children: [],
    loc: loc,
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

function getFunctionScope(scope: TempScope): TempScope {
  let s = scope;
  while (s.type !== "Function" && s.type !== "Script") {
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
  type: string
) {
  if (isNode(declaratorId, "Identifier")) {
    targetScope.names[declaratorId.name] = { type, refs: [] };
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
  return path.node.body.some(node => {
    if (!isNode(node, "VariableDeclaration")) {
      return false;
    }
    return isLetOrConst(node);
  });
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
    // Removing unneed information from TempScope such as parent reference and
    // name types. We also need to convert BabelLocation to the Location type.
    const bindings = Object.keys(scope.names).reduce((_bindings, n) => {
      const nameRefs = scope.names[n];
      switch (nameRefs.type) {
        case "var":
        case "let":
        case "const":
        case "param":
          _bindings[n] = nameRefs.refs.map(location => {
            return fromBabelLocation(location, sourceId);
          });
          break;
      }
      return _bindings;
    }, ((Object.create(null): any): ParsedScopeNamesReferences));
    return {
      start: fromBabelLocation(scope.loc.start, sourceId),
      end: fromBabelLocation(scope.loc.end, sourceId),
      type: scope.type.toLowerCase(),
      bindings,
      children: toParsedScopes(scope.children, sourceId)
    };
  });
}

/**
 * Creates at visitor for babel-traverse that will parse/extract all bindings
 * information from the source. See also findScopes to perform lookup of the
 * scope information for specific location.
 */
function createParseJSScopeVisitor(sourceId: SourceId): ParseJSScopeVisitor {
  let parent: TempScope = createTempScope("Global", null, null);
  let savedParents: WeakMap<NodePath, TempScope> = new WeakMap();
  const traverseVisitor = {
    enter(path: NodePath) {
      const tree = path.node;
      const location = path.node.loc;
      if (path.isProgram()) {
        savedParents.set(path, parent);
        parent = createTempScope("Script", parent, location);
        return;
      }
      if (
        path.isFunctionDeclaration() ||
        path.isFunctionExpression() ||
        path.isArrowFunctionExpression()
      ) {
        savedParents.set(path, parent);
        const scope = createTempScope("Function", parent, location);
        if (isNode(tree.id, "Identifier")) {
          const functionName = { type: "fn", refs: [] };
          getFunctionScope(parent).names[tree.id.name] = functionName;
          scope.names[tree.id.name] = functionName;
        }
        tree.params.forEach(param => parseDeclarator(param, scope, "param"));
        parent = scope;
        return;
      }
      if (path.isForInStatement() || path.isForStatement()) {
        const init = tree.init || tree.left;
        if (isNode(init, "VariableDeclaration") && isLetOrConst(init)) {
          // Debugger will create new lexical environment for the for.
          savedParents.set(path, parent);
          parent = createTempScope("For", parent, location);
        }
        return;
      }
      if (path.isCatchClause()) {
        savedParents.set(path, parent);
        parent = createTempScope("Catch", parent, location);
        parseDeclarator(tree.param, parent, "param");
        return;
      }
      if (path.isBlockStatement()) {
        if (hasLetOrConst(path)) {
          // Debugger will create new lexical environment for the block.
          savedParents.set(path, parent);
          parent = createTempScope("Block", parent, location);
        }
        return;
      }
      if (path.isVariableDeclaration()) {
        // Finds right lexical environment
        const hoistAt = !isLetOrConst(tree) ? getFunctionScope(parent) : parent;
        tree.declarations.forEach(declarator => {
          parseDeclarator(declarator.id, hoistAt, tree.kind);
        });
        return;
      }
      if (path.isIdentifier()) {
        const scope = findIdentifierInScopes(parent, tree.name);
        if (scope) {
          scope.names[tree.name].refs.push(tree.loc.start);
        }
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
      return toParsedScopes(parent.children, sourceId) || [];
    }
  };
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
function findScopes(scopes: ParsedScope[], location: Location): SourceScope[] {
  // Find inner most in the tree structure.
  let searchInScopes = scopes;
  const found = [];
  while (searchInScopes) {
    let foundOne = searchInScopes.some(s => {
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
      start: i.start,
      end: i.end,
      bindings: i.bindings
    };
  });
}

module.exports = {
  createParseJSScopeVisitor,
  findScopes
};
