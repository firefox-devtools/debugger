// @flow

import { PROMISE } from "../utils/redux/middleware/promise";
import {
  getExpression,
  getExpressions,
  getSelectedFrameId
} from "../selectors";
import { wrapExpression } from "../utils/expressions";
import type { Expression } from "../types";
import type { ThunkArgs } from "./types";

type frameIdType = string | null;

/**
 * Add expression for debugger to watch
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
export function addExpression(input: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    if (!input) {
      return;
    }

    const expression = getExpression(getState(), input);
    if (expression) {
      return dispatch(evaluateExpression(expression));
    }

    dispatch({
      type: "ADD_EXPRESSION",
      input
    });

    const newExpression = getExpression(getState(), input);
    dispatch(evaluateExpression(newExpression));
  };
}

export function updateExpression(input: string, expression: Expression) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (!input || input == expression.input) {
      return;
    }

    dispatch({
      type: "UPDATE_EXPRESSION",
      expression,
      input: input
    });

    dispatch(evaluateExpressions());
  };
}

/**
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
export function deleteExpression(expression: Expression) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: "DELETE_EXPRESSION",
      input: expression.input
    });
  };
}

/**
 *
 * @memberof actions/pause
 * @param {number} selectedFrameId
 * @static
 */
export function evaluateExpressions() {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    const expressions = getExpressions(getState()).toJS();
    for (const expression of expressions) {
      await dispatch(evaluateExpression(expression));
    }
  };
}

function evaluateExpression(expression: Expression) {
  return function({ dispatch, getState, client }: ThunkArgs) {
    if (!expression.input) {
      console.warn("Expressions should not be empty");
      return;
    }

    const frameId = getSelectedFrameId(getState());
    const input = wrapExpression(expression.input);
    return dispatch({
      type: "EVALUATE_EXPRESSION",
      input: expression.input,
      [PROMISE]: client.evaluate(input, { frameId })
    });
  };
}
