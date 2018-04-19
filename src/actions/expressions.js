/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getExpression,
  getExpressions,
  getSelectedFrame,
  getSelectedFrameId,
  getSource,
  getSelectedSource,
  getSelectedScopeMappings
} from "../selectors";
import { PROMISE } from "./utils/middleware/promise";
import { isGeneratedId } from "devtools-source-map";
import { wrapExpression } from "../utils/expressions";
import * as parser from "../workers/parser";
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

    const expressionError = await parser.hasSyntaxError(input);

    const expression = getExpression(getState(), input);
    if (expression) {
      return dispatch(evaluateExpression(expression));
    }

    dispatch({ type: "ADD_EXPRESSION", input, expressionError });

    const newExpression = getExpression(getState(), input);
    if (newExpression) {
      return dispatch(evaluateExpression(newExpression));
    }
  };
}

export function clearExpressionError() {
  return { type: "CLEAR_EXPRESSION_ERROR" };
}

export function updateExpression(input: string, expression: Expression) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    if (!input) {
      return;
    }

    const expressionError = await parser.hasSyntaxError(input);
    dispatch({
      type: "UPDATE_EXPRESSION",
      expression,
      input: expressionError ? expression.input : input,
      expressionError
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
    const inputs = expressions.map(({ input }) => input);
    const frameId = getSelectedFrameId(getState());
    const results = await client.evaluateExpressions(inputs, frameId);
    dispatch({ type: "EVALUATE_EXPRESSIONS", inputs, results });
  };
}

function evaluateExpression(expression: Expression) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    if (!expression.input) {
      console.warn("Expressions should not be empty");
      return;
    }

    let input = expression.input;
    const frame = getSelectedFrame(getState());

    if (frame) {
      const { location } = frame;
      const source = getSource(getState(), location.sourceId);
      const sourceId = source.get("id");

      const selectedSource = getSelectedSource(getState());

      if (
        selectedSource &&
        !isGeneratedId(sourceId) &&
        !isGeneratedId(selectedSource.get("id"))
      ) {
        input = await dispatch(getMappedExpression(input));
      }
    }

    const frameId = getSelectedFrameId(getState());

    return dispatch({
      type: "EVALUATE_EXPRESSION",
      input: expression.input,
      [PROMISE]: client.evaluateInFrame(wrapExpression(input), frameId)
    });
  };
}

/**
 * Gets information about original variable names from the source map
 * and replaces all posible generated names.
 */
export function getMappedExpression(expression: string) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const mappings = getSelectedScopeMappings(getState());
    if (!mappings) {
      return expression;
    }

    return parser.mapOriginalExpression(expression, mappings);
  };
}
