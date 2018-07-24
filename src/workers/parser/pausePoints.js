/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { traverseAst } from "./utils/ast";
import * as t from "@babel/types";
import isEqual from "lodash/isEqual";

import type { BabelNode } from "@babel/types";
import type { SimplePath } from "./utils/simple-path";

const isForStatement = node =>
  t.isForStatement(node) || t.isForOfStatement(node);

const isControlFlow = node =>
  isForStatement(node) ||
  t.isWhileStatement(node) ||
  t.isIfStatement(node) ||
  t.isSwitchCase(node) ||
  t.isSwitchStatement(node) ||
  t.isTryStatement(node) ||
  t.isWithStatement(node);

const isAssignment = node =>
  t.isVariableDeclarator(node) ||
  t.isAssignmentExpression(node) ||
  t.isAssignmentPattern(node);

const isImport = node => t.isImport(node) || t.isImportDeclaration(node);
const isReturn = node => t.isReturnStatement(node);
const isCall = node => t.isCallExpression(node) || t.isJSXElement(node);

const inStepExpression = parent =>
  t.isArrayExpression(parent) ||
  t.isObjectProperty(parent) ||
  t.isCallExpression(parent) ||
  t.isJSXElement(parent) ||
  t.isSequenceExpression(parent);

const inExpression = (parent, grandParent) =>
  inStepExpression(parent) ||
  t.isJSXAttribute(grandParent) ||
  t.isTemplateLiteral(parent);

const isExport = node =>
  t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node);

function getStartLine(node) {
  return node.loc.start.line;
}

// Finds the first call item in a step expression so that we can step
// to the beginning of the list and either step in or over. e.g. [], x(), { }
function isFirstCall(node, parentNode, grandParentNode) {
  let children = [];
  if (t.isArrayExpression(parentNode)) {
    children = parentNode.elements;
  }

  if (t.isObjectProperty(parentNode)) {
    children = grandParentNode.properties.map(({ value }) => value);
  }

  if (t.isSequenceExpression(parentNode)) {
    children = parentNode.expressions;
  }

  if (t.isCallExpression(parentNode)) {
    children = parentNode.arguments;
  }

  return children.find(child => isCall(child)) === node;
}

// Check to see if the node is a step expression and if any of its children
// expressions include calls. e.g. [ a() ], { a: a() }
function hasCall(node) {
  let children = [];
  if (t.isArrayExpression(node)) {
    children = node.elements;
  }

  if (t.isObjectExpression(node)) {
    children = node.properties.map(({ value }) => value);
  }

  if (t.isSequenceExpression(node)) {
    children = node.expressions;
  }

  if (t.isCallExpression(node)) {
    children = node.arguments;
  }

  return children.find(child => isCall(child));
}

export function getPausePoints(sourceId: string) {
  const state = {};
  traverseAst(sourceId, { enter: onEnter }, state);
  return state;
}

/* eslint-disable complexity */
function onEnter(node: BabelNode, ancestors: SimplePath[], state) {
  const parent = ancestors[ancestors.length - 1];
  const parentNode = parent && parent.node;
  const grandParent = ancestors[ancestors.length - 2];
  const grandParentNode = grandParent && grandParent.node;
  const startLocation = node.loc.start;

  if (
    isImport(node) ||
    t.isClassDeclaration(node) ||
    isExport(node) ||
    t.isDebuggerStatement(node) ||
    t.isThrowStatement(node) ||
    t.isBreakStatement(node) ||
    t.isContinueStatement(node)
  ) {
    return addStopPoint(state, startLocation);
  }

  if (isControlFlow(node)) {
    addPoint(state, startLocation, isForStatement(node));

    const test = node.test || node.discriminant;
    if (test) {
      addStopPoint(state, test.loc.start);
    }
    return;
  }

  if (t.isBlockStatement(node) || t.isArrayExpression(node)) {
    return addEmptyPoint(state, startLocation);
  }

  if (isReturn(node)) {
    // We do not want to pause at the return if the
    // argument is a call on the same line e.g. return foo()

    return addPoint(
      state,
      startLocation,
      !isCall(node.argument) ||
        getStartLine(node) != getStartLine(node.argument)
    );
  }

  if (isAssignment(node)) {
    // step at assignments unless the right side is a call or default assignment
    // e.g. `var a = b()`,  `a = b(c = 2)`, `a = [ b() ]`
    const value = node.right || node.init;
    const defaultAssignment =
      t.isFunction(parentNode) && parent.key === "params";
    const includesCall = isCall(value) || hasCall(value);

    return addPoint(state, startLocation, !includesCall && !defaultAssignment);
  }

  if (isCall(node)) {
    let location = startLocation;

    // When functions are chained, we want to use the property location
    // e.g `foo().bar()`
    if (t.isMemberExpression(node.callee)) {
      location = node.callee.property.loc.start;
    }

    // NOTE: We want to skip all nested calls in expressions except for the
    // first call in arrays and objects expression e.g. [], {}, call
    const step =
      isFirstCall(node, parentNode, grandParentNode) ||
      !inExpression(parentNode, grandParentNode);

    // NOTE: we add a point at the beginning of the expression
    // and each of the calls because the engine does not support
    // column-based member expression calls.
    addPoint(state, startLocation, { break: true, step });

    if (location && !isEqual(location, startLocation)) {
      addPoint(state, location, { break: true, step });
    }

    return;
  }

  if (t.isClassProperty(node)) {
    return addBreakPoint(state, startLocation);
  }

  if (t.isFunction(node)) {
    const { line, column } = node.loc.end;
    addBreakPoint(state, startLocation);
    return addEmptyPoint(state, { line, column: column - 1 });
  }

  if (!hasPoint(state, startLocation) && inStepExpression(parentNode)) {
    return addEmptyPoint(state, startLocation);
  }
}

function hasPoint(state, { line, column }) {
  return state[line] && state[line][column];
}

function addPoint(
  state,
  { line, column },
  types: boolean | { break?: boolean, step?: boolean }
) {
  if (typeof types === "boolean") {
    types = { step: types, break: types };
  }

  if (!state[line]) {
    state[line] = {};
  }
  state[line][column] = types;
  return state;
}

function addStopPoint(state, location) {
  return addPoint(state, location, { break: true, step: true });
}

function addEmptyPoint(state, location) {
  return addPoint(state, location, {});
}

function addBreakPoint(state, location) {
  return addPoint(state, location, { break: true });
}
