/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Expressions reducer
 * @module reducers/expressions
 */

import makeRecord from "../utils/makeRecord";
import { List, Map } from "immutable";
import { omit, zip } from "lodash";

import { createSelector } from "reselect";
import { prefs } from "../utils/prefs";

import type { Expression } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type ExpressionState = {
  expressions: List<Expression>,
  expressionError: boolean,
  autocompleteMatches: Map<string, List<string>>
};

export const createExpressionState = makeRecord(
  ({
    expressions: List(restoreExpressions()),
    expressionError: false,
    autocompleteMatches: Map({})
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
      return appendExpressionToList(state, {
        input: action.input,
        value: null,
        updating: true
      });

    case "UPDATE_EXPRESSION":
      const key = action.expression.input;
      return updateExpressionInList(state, key, {
        input: action.input,
        value: null,
        updating: true
      }).set("expressionError", !!action.expressionError);

    case "EVALUATE_EXPRESSION":
      return updateExpressionInList(state, action.input, {
        input: action.input,
        value: action.value,
        updating: false
      });

    case "EVALUATE_EXPRESSIONS":
      const { inputs, results } = action;

      return zip(inputs, results).reduce(
        (newState, [input, result]) =>
          updateExpressionInList(newState, input, {
            input: input,
            value: result,
            updating: false
          }),
        state
      );

    case "DELETE_EXPRESSION":
      return deleteExpression(state, action.input);

    case "CLEAR_EXPRESSION_ERROR":
      return state.set("expressionError", false);

    // respond to time travel
    case "TRAVEL_TO":
      return travelTo(state, action);

    case "AUTOCOMPLETE":
      const { matchProp, matches } = action.result;
      return state.updateIn(
        ["autocompleteMatches", matchProp],
        list => matches
      );
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
      updateExpressionInList(finalState, previousState.input, {
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

function storeExpressions({ expressions }) {
  prefs.expressions = expressions
    .map(expression => omit(expression, "value"))
    .toJS();
}

function appendExpressionToList(state: Record<ExpressionState>, value: any) {
  const newState = state.update("expressions", () => {
    return state.expressions.push(value);
  });

  storeExpressions(newState);
  return newState;
}

function updateExpressionInList(
  state: Record<ExpressionState>,
  key: string,
  value: any
) {
  const newState = state.update("expressions", () => {
    const list = state.expressions;
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
  expressions => expressions.expressions
);

export const getAutocompleteMatches = createSelector(
  getExpressionsWrapper,
  expressions => expressions.autocompleteMatches
);

export function getExpression(state: OuterState, input: string) {
  return getExpressions(state).find(exp => exp.input == input);
}

export function getAutocompleteMatchset(state: OuterState, input: string) {
  return getAutocompleteMatches(state).get(input);
}

export const getExpressionError = createSelector(
  getExpressionsWrapper,
  expressions => expressions.expressionError
);

export default update;
