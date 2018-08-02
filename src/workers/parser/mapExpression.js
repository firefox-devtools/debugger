/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import mapOriginalExpression from "./mapOriginalExpression";
import mapExpressionBindings from "./mapBindings";

import { hasSyntaxError } from "./validate";
import { buildScopeList } from "./getScopes";
import generate from "@babel/generator";
import * as t from "@babel/types";

function handleTopLevelAwait(expression) {
  if (hasSyntaxError(expression) && expression.match(/await/)) {
    const newExpression = `(async () => { return ${expression} })().then(r => console.log(r))`;
    if (!hasSyntaxError(newExpression)) {
      return newExpression;
    }
  }

  return expression;
}

export default function mapExpression(
  expression: string,
  mappings: {
    [string]: string | null
  },
  bindings: string[],
  shouldMapBindings: boolean = true
): string {
  expression = handleTopLevelAwait(expression);
  try {
    if (mappings) {
      expression = mapOriginalExpression(expression, mappings);
    }

    if (shouldMapBindings) {
      expression = mapExpressionBindings(expression, bindings);
    }
  } catch (e) {
    console.log(e);
  }

  return expression;
}
