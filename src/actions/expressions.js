// @flow

const constants = require("../constants");
const { PROMISE } = require("../utils/redux/middleware/promise");

const { getExpressions, getSelectedFrame } = require("../selectors");

import type { Expression } from "devtools-client-adapters/src/types";
import type { ThunkArgs } from "./types";

type frameIdType = string | null;

function expressionExists(expressions, expression) {
  return !!expressions.find(e => e.input == expression.input);
}

/**
 * Add expression for debugger to watch
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
function addExpression(expression: Expression) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const expressions = getExpressions(getState()).toSeq();
    if (!expression.input || expressionExists(expressions, expression)) {
      return;
    }

    const id = parseInt(expression.id, 10) || expressions.size++;

    dispatch({
      type: constants.ADD_EXPRESSION,
      id: id,
      input: expression.input
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
function updateExpression(expression: Expression) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: constants.UPDATE_EXPRESSION,
      id: expression.id,
      input: expression.input
    });
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
      id: expression.id
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
    for (let expression of getExpressions(getState())) {
      if (!expression.input) {
        console.warn("Expressions should not be empty");
        continue;
      }

      await dispatch({
        type: constants.EVALUATE_EXPRESSION,
        id: expression.id,
        input: expression.input,
        [PROMISE]: client.evaluate(expression.input, { frameId })
      });
    }
  };
}

module.exports = {
  addExpression,
  updateExpression,
  deleteExpression,
  evaluateExpressions,
};
