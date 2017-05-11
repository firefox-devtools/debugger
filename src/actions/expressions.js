// @flow

import constants from "../constants";
import { PROMISE } from "../utils/redux/middleware/promise";
import { getExpression, getExpressions, getSelectedFrame } from "../selectors";

import type { Expression } from "../types";
import type { ThunkArgs } from "./types";

type frameIdType = string | null;

function expressionExists(expressions, input) {
  return !!expressions.find(e => e.input == input);
}

/**
 * Add expression for debugger to watch
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
type addExpressionOptions = { visible: boolean };
export type AddExpression = (string, ?addExpressionOptions) => Promise<null>;
export function addExpression(
  input: string,
  { visible = true }: addExpressionOptions = {}
) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const expressions = getExpressions(getState());
    if (!input || expressionExists(expressions, input)) {
      const expression = getExpression(getState(), input);
      if (!expression.visible && visible) {
        await dispatch(deleteExpression(expression));
      } else {
        return;
      }
    }

    dispatch({
      type: constants.ADD_EXPRESSION,
      input,
      visible
    });

    const selectedFrame = getSelectedFrame(getState());
    const selectedFrameId = selectedFrame ? selectedFrame.id : null;
    dispatch(evaluateExpression({ input, visible }, selectedFrameId));
  };
}

export function updateExpression(input: string, expression: Expression) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (!input || input == expression.input) {
      return;
    }

    dispatch({
      type: constants.UPDATE_EXPRESSION,
      expression,
      input: input,
      visible: expression.visible
    });

    const selectedFrame = getSelectedFrame(getState());
    const selectedFrameId = selectedFrame ? selectedFrame.id : null;
    dispatch(evaluateExpressions(selectedFrameId));
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
      type: constants.DELETE_EXPRESSION,
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
export function evaluateExpressions(frameId: frameIdType) {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    const expressions = getExpressions(getState()).toJS();
    if (!frameId) {
      const selectedFrame = getSelectedFrame(getState());
      frameId = selectedFrame ? selectedFrame.id : null;
    }
    for (let expression of expressions) {
      await dispatch(evaluateExpression(expression, frameId));
    }
  };
}

function evaluateExpression(expression, frameId: frameIdType) {
  return function({ dispatch, getState, client }: ThunkArgs) {
    if (!expression.input) {
      console.warn("Expressions should not be empty");
      return;
    }

    return dispatch({
      type: constants.EVALUATE_EXPRESSION,
      input: expression.input,
      visible: expression.visible,
      [PROMISE]: client.evaluate(expression.input, { frameId })
    });
  };
}
