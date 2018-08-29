/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import mapOriginalExpression from "./mapOriginalExpression";
import mapExpressionBindings from "./mapBindings";
import handleTopLevelAwait from "./mapAwaitExpression";

export default function mapExpression(
  expression: string,
  mappings: {
    [string]: string | null
  },
  bindings: string[],
  shouldMapBindings: boolean = true,
  shouldMapAwait: boolean = true
): string {
  try {
    if (mappings) {
      expression = mapOriginalExpression(expression, mappings);
    }

    if (shouldMapBindings) {
      expression = mapExpressionBindings(expression, bindings);
    }

    if (shouldMapAwait) {
      expression = handleTopLevelAwait(expression);
    }
  } catch (e) {
    console.log(e);
  }

  return expression;
}
