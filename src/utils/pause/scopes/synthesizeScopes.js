/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getBindingVariables } from "./getVariables";
import { simplifyDisplayName } from "../../frame";
import { getFramePopVariables, getThisVariable } from "./utils";

import type { Frame, Why, Scope, SyntheticScope } from "debugger-html";

import type { NamedValue } from "./types";

function getSynteticScopeTitle(type, generatedScopes) {
  if (type === "function") {
    // FIXME Use original function name here
    const lastGeneratedScope = generatedScopes[generatedScopes.length - 1];
    const isLastGeneratedScopeFn =
      lastGeneratedScope && lastGeneratedScope.type === "function";
    return isLastGeneratedScopeFn && lastGeneratedScope.function.displayName
      ? simplifyDisplayName(lastGeneratedScope.function.displayName)
      : L10N.getStr("anonymous");
  }
  return L10N.getStr("scopes.block");
}

function findOriginalBindings(
  bindingsNames,
  generatedScopes,
  key,
  foundGeneratedNames
) {
  return bindingsNames.reduce((vars, name) => {
    // Find binding name in the original source bindings
    const generatedScope = generatedScopes.find(
      gs => gs.sourceBindings && name in gs.sourceBindings
    );
    if (!generatedScope || !generatedScope.sourceBindings) {
      return vars;
    }
    // .. and map it to the generated name
    const generatedName = generatedScope.sourceBindings[name];
    // Skip if we already use the generated name
    if (generatedName && !foundGeneratedNames[generatedName]) {
      if (generatedScope.bindings.variables[generatedName]) {
        vars.push({
          name,
          generatedName,
          path: `${key}/${generatedName}`,
          contents: generatedScope.bindings.variables[generatedName]
        });
        foundGeneratedNames[generatedName] = true;
        return vars;
      }

      const arg = generatedScope.bindings.arguments.find(
        arg_ => arg_[generatedName]
      );
      if (arg) {
        vars.push({
          name,
          generatedName,
          path: `${key}/${generatedName}`,
          contents: arg[generatedName]
        });
        foundGeneratedNames[generatedName] = true;
        return vars;
      }
    }

    vars.push({
      name,
      generatedName,
      path: `${key}/${generatedName}`,
      contents: { value: { type: "undefined" } }
    });
    return vars;
  }, []);
}

function findUnusedBindings(generatedScopes, foundGeneratedNames, key) {
  const allGeneratedVars = generatedScopes.reduce((acc, { bindings }) => {
    return acc.concat(getBindingVariables(bindings, key));
  }, []);
  return allGeneratedVars.filter(v => !foundGeneratedNames[v.name]);
}

// Create a synthesized scope based on its binding names and
// generated/original scopes information.
function synthesizeScope(
  syntheticScope: SyntheticScope,
  index: number,
  actor: string,
  key: string,
  scopeIndex: number,
  lastScopeIndex: number,
  generatedScopes: Scope[],
  foundGeneratedNames: { [name: string]: boolean },
  scope,
  frameScopes: Scope,
  selectedFrame: Frame,
  why: Why
): NamedValue[] {
  const { bindingsNames } = syntheticScope;
  const isLast = index === lastScopeIndex;

  let vars = findOriginalBindings(
    bindingsNames,
    generatedScopes,
    key,
    foundGeneratedNames
  );

  if (isLast) {
    // For the last synthesized scope, apply all generated names we did not use
    vars = [
      ...vars,
      ...findUnusedBindings(generatedScopes, foundGeneratedNames, key)
    ];
  }

  if (index === 0) {
    const isLocalScope = scope.actor === frameScopes.actor;

    // For the first synthesized scope, add this and other vars.
    if (isLocalScope) {
      vars = [...vars, ...getFramePopVariables(why, key)];

      const this_ = getThisVariable(selectedFrame, key);

      if (this_) {
        vars.push(this_);
      }
    }
  }

  return vars;
}

export function synthesizeScopes(
  scope: Scope,
  selectedFrame: Frame,
  frameScopes: Scope,
  why: Why,
  scopeIndex: number
): NamedValue[] {
  const { actor, syntheticScopes } = scope;
  if (!syntheticScopes) {
    return [];
  }

  // Collect all connected generated scopes.
  const generatedScopes = [];
  for (
    let count = syntheticScopes.groupLength, s = scope;
    count > 0 && s;
    count--
  ) {
    generatedScopes.push(s);
    s = s.parent;
  }

  const foundGeneratedNames = (Object.create(null): any);
  const lastScopeIndex = syntheticScopes.scopes.length - 1;
  return syntheticScopes.scopes.reduce((result, syntheticScope, index) => {
    const key = `${actor}-${scopeIndex + index}`;
    const bindings = synthesizeScope(
      syntheticScope,
      index,
      actor,
      key,
      scopeIndex,
      lastScopeIndex,
      generatedScopes,
      foundGeneratedNames,
      scope,
      frameScopes,
      selectedFrame,
      why
    );

    if (bindings && bindings.length) {
      const title = getSynteticScopeTitle(syntheticScope.type, generatedScopes);
      bindings.sort((a, b) => a.name.localeCompare(b.name));
      result.push({
        name: title,
        path: key,
        contents: bindings
      });
    }
    return result;
  }, []);
}
