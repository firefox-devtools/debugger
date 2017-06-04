// @flow

import { PROMISE } from "../utils/redux/middleware/promise";
import { getExpression, getExpressions, getSelectedFrame } from "../selectors";

import type { Expression } from "../types";
import type { ThunkArgs, Action } from "./types";

type frameIdType = string | null;

/**
 * Add expression for debugger to watch
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
export function addExpression(input: string, { visible = true }: Object = {}) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    if (!input) {
      return;
    }

    const expression = getExpression(getState(), input);
    if (expression && expression.visible) {
      return;
    }

    // Lets make the expression visible
    if (expression) {
      return dispatch(
        ({
          type: "UPDATE_EXPRESSION",
          expression,
          input,
          visible: true
        }: Action)
      );
    }

    dispatch(
      ({
        type: "ADD_EXPRESSION",
        input,
        visible
      }: Action)
    );

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

    dispatch(
      ({
        type: "UPDATE_EXPRESSION",
        expression,
        input,
        visible: expression.visible
      }: Action)
    );

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
    dispatch(
      ({
        type: "DELETE_EXPRESSION",
        input: expression.input
      }: Action)
    );
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

    return dispatch(
      ({
        type: "EVALUATE_EXPRESSION",
        input: expression.input,
        visible: expression.visible,
        [PROMISE]: client.evaluate(expression.input, { frameId })
      }: Action)
    );
  };
}
