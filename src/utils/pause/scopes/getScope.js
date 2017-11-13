/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { getBindingVariables, getSourceBindingVariables } from "./getVariables";
import { getFramePopVariables, getThisVariable } from "./utils";
import { simplifyDisplayName } from "../../frame";

import type { Frame, Pause, Scope } from "debugger-html";

import type { NamedValue } from "./types";

function getScopeTitle(type, scope) {
  if (type === "function") {
    return scope.function.displayName
      ? simplifyDisplayName(scope.function.displayName)
      : L10N.getStr("anonymous");
  }
  return L10N.getStr("scopes.block");
}

export function getScope(
  scope: Scope,
  selectedFrame: Frame,
  frameScopes: Scope,
  pauseInfo: Pause,
  scopeIndex: number
): ?NamedValue {
  const { type, actor } = scope;

  const isLocalScope = scope.actor === frameScopes.actor;

  const key = `${actor}-${scopeIndex}`;
  if (type === "function" || type === "block") {
    const bindings = scope.bindings;
    const sourceBindings = scope.sourceBindings;

    let vars = sourceBindings
      ? getSourceBindingVariables(bindings, sourceBindings, key)
      : getBindingVariables(bindings, key);

    // show exception, return, and this variables in innermost scope
    if (isLocalScope) {
      vars = vars.concat(getFramePopVariables(pauseInfo, key));

      const this_ = getThisVariable(selectedFrame, key);

      if (this_) {
        vars.push(this_);
      }
    }

    if (vars && vars.length) {
      const title = getScopeTitle(type, scope);
      vars.sort((a, b) => a.name.localeCompare(b.name));
      return {
        name: title,
        path: key,
        contents: vars
      };
    }
  } else if (type === "object") {
    let value = scope.object;
    // If this is the global window scope, mark it as such so that it will
    // preview Window: Global instead of Window: Window
    if (value.class === "Window") {
      value = { ...scope.object, displayClass: "Global" };
    }
    return {
      name: scope.object.class,
      path: key,
      contents: { value }
    };
  }

  return null;
}
