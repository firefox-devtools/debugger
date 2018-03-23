/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { traverseAst } from "./utils/ast";
import * as t from "@babel/types";

import type { AstLocation } from "./types";
import type { BabelNode } from "@babel/types";
import type { SimplePath } from "./utils/simple-path";

export type PausePoint = {|
  location: AstLocation,
  types: {| breakpoint: boolean, stepOver: boolean |}
|};

export type PausePoints = PausePoint[];

const isControlFlow = node =>
  t.isForStatement(node) || t.isWhileStatement(node) || t.isIfStatement(node);

const isAssignment = node =>
  t.isVariableDeclarator(node) || t.isAssignmentExpression(node);

const isImport = node => t.isImport(node) || t.isImportDeclaration(node);
const isReturn = node => t.isReturnStatement(node);
const inExpression = parent =>
  t.isArrayExpression(parent.node) ||
  t.isObjectProperty(parent.node) ||
  t.isCallExpression(parent.node) ||
  t.isTemplateLiteral(parent.node);

export function getPausePoints(sourceId: string) {
  const state = [];
  traverseAst(sourceId, { enter: onEnter }, state);
  return state;
}

function onEnter(node: BabelNode, ancestors: SimplePath[], state) {
  const parent = ancestors[ancestors.length - 1];

  if (
    isAssignment(node) ||
    isImport(node) ||
    isControlFlow(node) ||
    t.isDebuggerStatement(node)
  ) {
    addPoint(state, node.loc.start);
  }

  if (isReturn(node)) {
    if (t.isCallExpression(node.argument)) {
      addEmptyPoint(state, node.loc.start);
    } else {
      addPoint(state, node.loc.start);
    }
  }

  if (t.isCallExpression(node)) {
    addPoint(state, node.loc.start, {
      breakpoint: true,

      // NOTE: we do not want to land inside an expression e.g. [], {}, call
      stepOver: !inExpression(parent)
    });
  }

  if (t.isFunction(node)) {
    const { line, column } = node.loc.end;
    addBreakPoint(state, node.loc.start);
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
