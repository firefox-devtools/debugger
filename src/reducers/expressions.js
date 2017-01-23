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
      return state.setIn(["expressions", action.id],
        { id: action.id,
          input: action.input,
          value: action.value,
          updating: false });

    case constants.EVALUATE_EXPRESSION:
      if (action.status === "done") {
        return state.mergeIn(["expressions", action.id],
          { id: action.id,
            input: action.input,
            value: action.value,
            updating: false });
      }
      break;

    case constants.UPDATE_EXPRESSION:
      return state.mergeIn(["expressions", action.id],
        { id: action.id,
          input: action.input,
          updating: true });

    case constants.DELETE_EXPRESSION:
      return deleteExpression(state, action.id);
  }

  return state;
}

function deleteExpression(state, id) {
  const index = getExpressions({ pause: state }).findKey(e => e.id == id);
  return state.deleteIn(["expressions", index]);
}

function getExpressions(state: OuterState) {
  return state.expressions.get("expressions");
}

module.exports = {
  State,
  update,
  getExpressions
};
