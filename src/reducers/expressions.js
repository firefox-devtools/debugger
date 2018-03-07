/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Expressions reducer
 * @module reducers/expressions
 */

import makeRecord from "../utils/makeRecord";
import { List } from "immutable";
import { omit } from "lodash";
import { createSelector } from "reselect";
import { prefs } from "../utils/prefs";

import type { Expression } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type ExpressionState = {
  expressions: List<Expression>,
  expressionError: boolean
};

export const createExpressionState = makeRecord(
  ({
    expressions: List(restoreExpressions()),
    expressionError: false
  }: ExpressionState)
);

function update(
  state: Record<ExpressionState> = createExpressionState(),
  action: Action
): Record<ExpressionState> {
  switch (action.type) {
    case "ADD_EXPRESSION":
      if (action.expressionError) {
        return state.set("expressionError", !!action.expressionError);
      }
      return appendToList(state, ["expressions"], {
        input: action.input,
        value: null,
        updating: true
      });
    case "UPDATE_EXPRESSION":
      const key = action.expression.input;
      return updateItemInList(state, ["expressions"], key, {
        input: action.input,
        value: null,
        updating: true
      }).set("expressionError", !!action.expressionError);
    case "EVALUATE_EXPRESSION":
      return updateItemInList(state, ["expressions"], action.input, {
        input: action.input,
        value: action.value,
        updating: false
      });
    case "DELETE_EXPRESSION":
      return deleteExpression(state, action.input);
    case "CLEAR_EXPRESSION_ERROR":
      return state.set("expressionError", false);

    // respond to time travel
    case "TRAVEL_TO": {
      return travelTo(state, action);
    }
  }

  return state;
}

function travelTo(state, action) {
  const { expressions } = action.data;
  if (!expressions) {
    return state;
  }
  return expressions.reduce(
    (finalState, previousState) =>
      updateItemInList(finalState, ["expressions"], previousState.input, {
        input: previousState.input,
        value: previousState.value,
        updating: false
      }),
    state
  );
}

function restoreExpressions() {
  const exprs = prefs.expressions;
  if (exprs.length == 0) {
    return;
  }
  return exprs;
}

function storeExpressions(state) {
  const expressions = state
    .getIn(["expressions"])
    .map(expression => omit(expression, "value"))
    .toJS();

  prefs.expressions = expressions;
}

function appendToList(
  state: Record<ExpressionState>,
  path: string[],
  value: any
) {
  const newState = state.updateIn(path, () => {
    return state.getIn(path).push(value);
  });
  storeExpressions(newState);
  return newState;
}

function updateItemInList(
  state: Record<ExpressionState>,
  path: string[],
  key: string,
  value: any
) {
  const newState = state.updateIn(path, () => {
    const list = state.getIn(path);
    const index = list.findIndex(e => e.input == key);
    return list.update(index, () => value);
  });
  storeExpressions(newState);
  return newState;
}

function deleteExpression(state: Record<ExpressionState>, input: string) {
  const index = getExpressions({ expressions: state }).findIndex(
    e => e.input == input
  );
  const newState = state.deleteIn(["expressions", index]);
  storeExpressions(newState);
  return newState;
}

type OuterState = { expressions: Record<ExpressionState> };

const getExpressionsWrapper = state => state.expressions;

export const getExpressions = createSelector(
  getExpressionsWrapper,
  expressions => expressions.get("expressions")
);

export function getExpression(state: OuterState, input: string) {
  return getExpressions(state).find(exp => exp.input == input);
}

export const getExpressionError = createSelector(
  getExpressionsWrapper,
  expressions => expressions.get("expressionError")
);

export default update;
