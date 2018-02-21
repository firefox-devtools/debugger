/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as t from "@babel/types";

import type { Location } from "../../types";

import { fastTraverseAst } from "./utils/ast";

const STOP = {};

export function isInvalidPauseLocation(location: Location) {
  const state = {
    invalid: false,
    location
  };

  try {
    fastTraverseAst(
      location.sourceId,
      { enter: invalidLocationVisitor },
      state
    );
  } catch (e) {
    if (e !== STOP) {
      throw e;
    }
  }

  return state.invalid;
}

function invalidLocationVisitor(node, ancestors, state) {
  const { location } = state;

  if (node.loc.end.line < location.line) {
    return;
  }
  if (node.loc.start.line > location.line) {
    throw STOP;
  }

  if (
    location.line === node.loc.start.line &&
    location.column >= node.loc.start.column &&
    t.isFunction(node) &&
    !t.isArrowFunctionExpression(node) &&
    (location.line < node.body.loc.start.line ||
      (location.line === node.body.loc.start.line &&
        location.column <= node.body.loc.start.column))
  ) {
    // Disallow pausing _inside_ in function arguments to avoid pausing inside
    // of destructuring and other logic.
    state.invalid = true;
    throw STOP;
  }

  if (
    location.line === node.loc.start.line &&
    location.column === node.loc.start.column &&
    t.isBlockStatement(node)
  ) {
    // Disallow pausing directly before the opening curly of a block statement.
    // Babel occasionally maps statements with unknown original positions to
    // this location.
    state.invalid = true;
    throw STOP;
  }
}
