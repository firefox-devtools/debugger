// @flow

const constants = require("../constants");
const { PROMISE } = require("../utils/redux/middleware/promise");

const { getExpressions, getSelectedFrame } = require("../selectors");

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
function addExpression(input: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const expressions = getExpressions(getState());
    if (!input || expressionExists(expressions, input)) {
      return;
    }

    dispatch({
      type: constants.ADD_EXPRESSION,
      input,
    });

    const selectedFrame = getSelectedFrame(getState());
    const selectedFrameId = selectedFrame ? selectedFrame.id : null;
    dispatch(evaluateExpression({ input }, selectedFrameId));
  };
}

function updateExpression(input: string, expression: Expression) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (!input || input == expression.input) {
      return;
    }

    dispatch({
      type: constants.UPDATE_EXPRESSION,
      expression,
      input: input,
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
function deleteExpression(expression: Expression) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: constants.DELETE_EXPRESSION,
      input: expression.input,
    });
  };
}

/**
 *
 * @memberof actions/pause
 * @param {number} selectedFrameId
 * @static
 */
function evaluateExpressions(frameId: frameIdType) {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    const expressions = getExpressions(getState()).toJS();
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
      [PROMISE]: client.evaluate(expression.input, { frameId }),
    });
  };
}

module.exports = {
  addExpression,
  updateExpression,
  deleteExpression,
  evaluateExpressions,
};
