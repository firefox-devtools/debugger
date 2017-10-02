// @flow

import {
  getExpression,
  getExpressions,
  getSelectedFrameId
} from "../selectors";
import { PROMISE } from "../utils/redux/middleware/promise";
import { wrapExpression } from "../utils/expressions";
import * as parser from "../utils/parser";
import type { Expression } from "../types";
import type { ThunkArgs } from "./types";

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
  return async function({ dispatch, getState, client }: ThunkArgs) {
    if (!expression.input) {
      console.warn("Expressions should not be empty");
      return;
    }

    const error = await parser.hasSyntaxError(expression.input);
    if (error) {
      return dispatch({
        type: "EVALUATE_EXPRESSION",
        input: expression.input,
        value: { input: expression.input, result: error }
      });
    }

    const frameId = getSelectedFrameId(getState());
    return dispatch({
      type: "EVALUATE_EXPRESSION",
      input: expression.input,
      [PROMISE]: client.evaluate(wrapExpression(expression.input), { frameId })
    });
  };
}
