/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { synthesizeScopes } from "./synthesizeScopes";
import { getScope } from "./getScope";

import type { Frame, Why, Scope, BindingContents } from "debugger-html";

export type NamedValue = {
  name: string,
  generatedName?: string,
  path: string,
  contents: BindingContents | NamedValue[]
};

export function getScopes(
  why: Why,
  selectedFrame: Frame,
  frameScopes: ?Scope
): ?(NamedValue[]) {
  if (!why || !selectedFrame) {
    return null;
  }

  if (!frameScopes) {
    return null;
  }

  const scopes = [];

  let scope = frameScopes;
  let scopeIndex = 1;

  while (scope) {
    const { syntheticScopes } = scope;
    let lastScope = scope;

    if (!syntheticScopes) {
      const scopeItem = getScope(
        scope,
        selectedFrame,
        frameScopes,
        why,
        scopeIndex
      );

      if (scopeItem) {
        scopes.push(scopeItem);
      }
      scopeIndex++;
    } else {
      scopes.push(
        ...synthesizeScopes(scope, selectedFrame, frameScopes, why, scopeIndex)
      );

      // skip to the next generated scope
      const scopeDepth = syntheticScopes.groupLength;
      for (let i = 1; lastScope.parent && i < scopeDepth; i++) {
        const nextScope = lastScope.parent;
        lastScope = nextScope;
      }

      scope = lastScope;
      scopeIndex += syntheticScopes.scopes.length;
    }
    scope = scope.parent;
  }

  return scopes;
}
