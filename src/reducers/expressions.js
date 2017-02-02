// @flow

const constants = require("../constants");
const makeRecord = require("../utils/makeRecord");
const I = require("immutable");

import type { Expression } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type ExpressionState = {
  expressions: I.List<Expression>
}

const State = makeRecord(({
  expressions: I.List()
} : ExpressionState));

function update(state = State(), action: Action): Record<ExpressionState> {
  switch (action.type) {

    case constants.ADD_EXPRESSION:
      return appendToList(state, ["expressions"], {
        input: action.input,
        value: null,
        updating: true
      });
    case constants.UPDATE_EXPRESSION:
      const key = action.expression.input;
      return updateItemInList(state, ["expressions"], key, {
        input: action.input,
        value: null,
        updating: true
      });
    case constants.EVALUATE_EXPRESSION:
      if (action.status === "done") {
        return updateItemInList(state, ["expressions"], action.input, {
          input: action.input,
          value: action.value,
          updating: false
        });
      }
      break;
    case constants.DELETE_EXPRESSION:
      return deleteExpression(state, action.input);
  }

  return state;
}

function appendToList(state: State, path: string[], value: any) {
  return state.updateIn(path, () => {
    return state.getIn(path).push(value);
  });
}

function updateItemInList(
  state: State, path: string[], key: string, value: any) {
  return state.updateIn(path, () => {
    const list = state.getIn(path);
    const index = list.findIndex(e => e.input == key);
    return list.update(index, () => value);
  });
}

function deleteExpression(state: State, input: string) {
  const index = getExpressions({ expressions: state })
    .findKey(e => e.input == input);
  return state.deleteIn(["expressions", index]);
}

type OuterState = { expressions: Record<ExpressionState> };

function getExpressions(state: OuterState) {
  return state.expressions.get("expressions");
}

module.exports = {
  State,
  update,
  getExpressions
};
