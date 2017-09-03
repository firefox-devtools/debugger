// @flow

import { List, Record } from "immutable";
import { omit } from "lodash";
import { createSelector } from "reselect";
import { prefs } from "../utils/prefs";

import type { Expression } from "../types";
import type { Action } from "../actions/types";

type State = {|
  expressions: List<Expression>,
  setExpressions: (List<Expression>) => State
|};

class StateClass extends Record({
  expressions: List()
}) {
  get expressions(): List<Expression> {
    return this.expressions;
  }

  setExpressions(expressions: List<Expression>): State {
    return this.set("expressions", expressions);
  }
}

function initialState(): State {
  return new StateClass({
    expressions: List(restoreExpressions())
  });
}

function update(state: State = initialState(), action: Action): State {
  switch (action.type) {
    case "ADD_EXPRESSION":
      return appendToList(state, {
        input: action.input,
        value: null,
        updating: true
      });
    case "UPDATE_EXPRESSION":
      const key = action.expression.input;
      return updateItemInList(state, key, {
        input: action.input,
        value: null,
        updating: true
      });
    case "EVALUATE_EXPRESSION":
      if (action.status === "done") {
        return updateItemInList(state, action.input, {
          input: action.input,
          value: action.value,
          updating: false
        });
      }
      break;
    case "DELETE_EXPRESSION":
      return deleteExpression(state, action.input);
  }

  return state;
}

function restoreExpressions(): Expression[] {
  const exprs: Expression[] = prefs.expressions;
  if (exprs.length == 0) {
    return [];
  }
  return exprs;
}

function storeExpressions(expressions: List<Expression>) {
  const newExpressions = expressions.map(expression =>
    omit(expression, "value")
  );

  prefs.expressions = newExpressions;
}

function appendToList(state: State, value: Expression) {
  const newState = state.setExpressions(state.expressions.push(value));
  storeExpressions(newState.expressions);
  return newState;
}

function updateItemInList(state: State, key: string, value: Expression) {
  const index = state.expressions.findIndex(e => e.input == key);
  const newState = state.setExpressions(
    state.expressions.update(index, () => value)
  );

  storeExpressions(newState.expressions);
  return newState;
}

function deleteExpression(state: State, input: string) {
  const index = getExpressions({ expressions: state }).findKey(
    e => e.input == input
  );
  const newState = state.setExpressions(state.expressions.deleteIn([index]));
  storeExpressions(newState.expressions);
  return newState;
}

type OuterState = { expressions: State };

function getExpressions(state: OuterState) {
  return state.expressions.expressions;
}

export function getExpression(state: OuterState, input: string) {
  return getExpressions(state).find(exp => exp.input == input);
}

export default update;
