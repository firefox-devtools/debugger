/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import mapOriginalExpression from "./mapOriginalExpression";
import mapExpressionBindings from "./mapBindings";

export default function mapExpression(
  expression: string,
  mappings: {
    [string]: string | null
  },
  bindings: string[],
  shouldMapBindings: boolean = true
): string {
  let originalExpression = expression;
  if (mappings) {
    originalExpression = mapOriginalExpression(expression, mappings);
  }

  let safeExpression = originalExpression;
  if (shouldMapBindings) {
    safeExpression = mapExpressionBindings(originalExpression, bindings);
  }

  return safeExpression;
}
