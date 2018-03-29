/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { traverseAst } from "./utils/ast";
import * as t from "@babel/types";
import isEqual from "lodash/isEqual";
import uniqBy from "lodash/uniqBy";

import type { AstLocation } from "./types";
import type { BabelNode } from "@babel/types";
import type { SimplePath } from "./utils/simple-path";

export type PausePoint = {|
  location: AstLocation,
  types: {| breakpoint: boolean, stepOver: boolean |}
|};

export type PausePoints = PausePoint[];

const isControlFlow = node =>
  t.isForStatement(node) ||
  t.isWhileStatement(node) ||
  t.isIfStatement(node) ||
  t.isSwitchCase(node) ||
  t.isSwitchStatement(node);

const isAssignment = node =>
  t.isVariableDeclarator(node) || t.isAssignmentExpression(node);

const isImport = node => t.isImport(node) || t.isImportDeclaration(node);
const isReturn = node => t.isReturnStatement(node);
const isCall = node => t.isCallExpression(node) || t.isJSXElement(node);

const inExpression = (parent, grandParent) =>
  t.isArrayExpression(parent) ||
  t.isObjectProperty(parent) ||
  t.isCallExpression(parent) ||
  t.isJSXElement(parent) ||
  t.isJSXAttribute(grandParent) ||
  t.isTemplateLiteral(parent);

const isExport = node =>
  t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node);

function removeDuplicatePoints(state) {
  return uniqBy(
    state,
    ({ location }) => `${location.line}-$${location.column}`
  );
}

export function getPausePoints(sourceId: string) {
  const state = [];
  traverseAst(sourceId, { enter: onEnter }, state);
  const uniqPoints = removeDuplicatePoints(state);
  return uniqPoints;
}

function onEnter(node: BabelNode, ancestors: SimplePath[], state) {
  const parent = ancestors[ancestors.length - 1];
  const grandParent = ancestors[ancestors.length - 2];
  const startLocation = node.loc.start;

  if (
    isImport(node) ||
    t.isClassDeclaration(node) ||
    isExport(node) ||
    t.isDebuggerStatement(node)
  ) {
    addPoint(state, startLocation);
  }

  if (isControlFlow(node)) {
    addEmptyPoint(state, startLocation);

    const test = node.test || node.discriminant;
    if (test) {
      addPoint(state, test.loc.start);
    }
  }

  if (isReturn(node)) {
    // We do not want to pause at the return and the call e.g. return foo()
    if (isCall(node.argument)) {
      addEmptyPoint(state, startLocation);
    } else {
      addPoint(state, startLocation);
    }
  }

  if (isAssignment(node)) {
    // We only want to pause at literal assignments `var a = foo()`
    const value = node.right || node.init;
    if (!isCall(value)) {
      addPoint(state, startLocation);
    }
  }

  if (isCall(node)) {
    let location = startLocation;

    // When functions are chained, we want to use the property location
    // e.g `foo().bar()`
    if (t.isMemberExpression(node.callee)) {
      location = node.callee.property.loc.start;
    }

    // NOTE: we do not want to land inside an expression e.g. [], {}, call
    const stepOver = !inExpression(
      parent.node,
      grandParent && grandParent.node
    );

    // NOTE: we add a point at the beginning of the expression
    // and each of the calls because the engine does not support
    // column-based member expression calls.
    addPoint(state, startLocation, { breakpoint: true, stepOver });
    if (location && !isEqual(location, startLocation)) {
      addPoint(state, location, { breakpoint: true, stepOver });
    }
  }

  if (t.isClassProperty(node)) {
    addBreakPoint(state, startLocation);
  }

  if (t.isFunction(node)) {
    const { line, column } = node.loc.end;
    addBreakPoint(state, startLocation);
    addPoint(state, { line, column: column - 1 });
  }

  if (t.isProgram(node)) {
    const lastStatement = node.body[node.body.length - 1];
    addPoint(state, lastStatement.loc.end);
  }
}

function formatNode(location, types) {
  return { location, types };
}

function addPoint(
  state,
  location,
  types = { breakpoint: true, stepOver: true }
) {
  state.push(formatNode(location, types));
}

function addEmptyPoint(state, location) {
  addPoint(state, location, { breakpoint: false, stepOver: false });
}

function addBreakPoint(state, location) {
  addPoint(state, location, { breakpoint: true, stepOver: false });
}
