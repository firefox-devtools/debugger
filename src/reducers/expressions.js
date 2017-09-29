// @flow

import makeRecord from "../utils/makeRecord";
import { List } from "immutable";
import { omit } from "lodash";
import { createSelector } from "reselect";
import { prefs } from "../utils/prefs";

import type { Expression } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type ExpressionState = {
  expressions: List<Expression>
};

export const State = makeRecord(
  ({
    expressions: List(restoreExpressions())
  }: ExpressionState)
);

function update(
  state: Record<ExpressionState> = State(),
  action: Action
): Record<ExpressionState> {
  switch (action.type) {
    case "ADD_EXPRESSION":
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
      });
    case "EVALUATE_EXPRESSION":
      return updateItemInList(state, ["expressions"], action.input, {
        input: action.input,
        value: action.value,
        updating: false
      });
    case "DELETE_EXPRESSION":
      return deleteExpression(state, action.input);
  }

  return state;
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

function appendToList(state: State, path: string[], value: any) {
  const newState = state.updateIn(path, () => {
    return state.getIn(path).push(value);
  });
  storeExpressions(newState);
  return newState;
}

function updateItemInList(
  state: State,
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

function deleteExpression(state: State, input: string) {
  const index = getExpressions({ expressions: state }).findKey(
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

export default update;
