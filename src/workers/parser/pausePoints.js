/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { traverseAst } from "./utils/ast";
import * as t from "@babel/types";
import isEqual from "lodash/isEqual";

import type { BabelNode } from "@babel/types";
import type { SimplePath } from "./utils/simple-path";

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

const inStepExpression = parent =>
  t.isArrayExpression(parent) ||
  t.isObjectProperty(parent) ||
  t.isCallExpression(parent) ||
  t.isJSXElement(parent);

const inExpression = (parent, grandParent) =>
  inStepExpression(parent) ||
  t.isJSXAttribute(grandParent) ||
  t.isTemplateLiteral(parent);

const isExport = node =>
  t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node);

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
  const startLocation = node.loc.start;

  if (
    isImport(node) ||
    t.isClassDeclaration(node) ||
    isExport(node) ||
    t.isDebuggerStatement(node)
  ) {
    return addStopPoint(state, startLocation);
  }

  if (isControlFlow(node)) {
    addEmptyPoint(state, startLocation);

    const test = node.test || node.discriminant;
    if (test) {
      addStopPoint(state, test.loc.start);
    }
    return;
  }

  if (isReturn(node)) {
    // We do not want to pause at the return and the call e.g. return foo()
    if (isCall(node.argument)) {
      return addEmptyPoint(state, startLocation);
    }
    return addStopPoint(state, startLocation);
  }

  if (isAssignment(node)) {
    // We only want to pause at literal assignments `var a = foo()`
    const value = node.right || node.init;
    if (!isCall(value)) {
      return addStopPoint(state, startLocation);
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
    const step = !inExpression(parent.node, grandParent && grandParent.node);

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
    return addStopPoint(state, { line, column: column - 1 });
  }

  if (t.isProgram(node)) {
    const lastStatement = node.body[node.body.length - 1];
    if (lastStatement) {
      return addStopPoint(state, lastStatement.loc.end);
    }
  }

  if (!hasPoint(state, startLocation) && inStepExpression(parentNode)) {
    return addEmptyPoint(state, startLocation);
  }
}

function hasPoint(state, { line, column }) {
  return state[line] && state[line][column];
}

function addPoint(state, { line, column }, types) {
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
