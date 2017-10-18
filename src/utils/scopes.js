/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { toPairs } from "lodash";
import { simplifyDisplayName } from "./frame";
import type {
  Frame,
  Pause,
  Scope,
  SyntheticScope,
  BindingContents
} from "debugger-html";

export type NamedValue = {
  name: string,
  generatedName?: string,
  path: string,
  contents: BindingContents | NamedValue[]
};

// VarAndBindingsPair actually is [name: string, contents: BindingContents]
type VarAndBindingsPair = Array<any>;
type VarAndBindingsPairs = Array<VarAndBindingsPair>;

// Create the tree nodes representing all the variables and arguments
// for the bindings from a scope.
function getBindingVariables(bindings, parentName): NamedValue[] {
  const args: VarAndBindingsPairs = bindings.arguments.map(
    arg => toPairs(arg)[0]
  );
  const variables: VarAndBindingsPairs = toPairs(bindings.variables);

  return args.concat(variables).map(binding => {
    const name = (binding[0]: string);
    const contents = (binding[1]: BindingContents);
    return {
      name,
      path: `${parentName}/${name}`,
      contents
    };
  });
}

function getSourceBindingVariables(
  bindings,
  sourceBindings: {
    [originalName: string]: string
  },
  parentName: string
): NamedValue[] {
  const result = getBindingVariables(bindings, parentName);
  const index: any = Object.create(null);
  result.forEach(entry => {
    index[entry.name] = { used: false, entry };
  });
  // Find and replace variables that is present in sourceBindings.
  const bound = Object.keys(sourceBindings).map(name => {
    const generatedName = sourceBindings[name];
    const foundMap = index[generatedName];
    let contents;
    if (foundMap) {
      foundMap.used = true;
      contents = foundMap.entry.contents;
    } else {
      contents = { value: { type: "undefined" } };
    }
    return {
      name,
      generatedName,
      path: `${parentName}/${generatedName}`,
      contents
    };
  });
  // Use rest of them (not found in the sourceBindings) as is.
  const unused = result.filter(entry => !index[entry.name].used);
  return bound.concat(unused);
}

export function getFramePopVariables(
  pauseInfo: Pause,
  path: string
): NamedValue[] {
  const vars = [];

  if (pauseInfo.why && pauseInfo.why.frameFinished) {
    const frameFinished = pauseInfo.why.frameFinished;

    // Always display a `throw` property if present, even if it is falsy.
    if (Object.prototype.hasOwnProperty.call(frameFinished, "throw")) {
      vars.push({
        name: "<exception>",
        path: `${path}/<exception>`,
        contents: { value: frameFinished.throw }
      });
    }

    if (Object.prototype.hasOwnProperty.call(frameFinished, "return")) {
      const returned = frameFinished.return;

      // Do not display undefined. Do display falsy values like 0 and false. The
      // protocol grip for undefined is a JSON object: { type: "undefined" }.
      if (typeof returned !== "object" || returned.type !== "undefined") {
        vars.push({
          name: "<return>",
          path: `${path}/<return>`,
          contents: { value: returned }
        });
      }
    }
  }

  return vars;
}

function getThisVariable(frame: any, path: string): ?NamedValue {
  const this_ = frame.this;

  if (!this_) {
    return null;
  }

  return {
    name: "<this>",
    path: `${path}/<this>`,
    contents: { value: this_ }
  };
}

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
  selectedFrame: ?Frame,
  pauseInfo: ?Pause
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
    // For the first synthesized scope, add this and other vars.
    if (pauseInfo) {
      vars = [...vars, ...getFramePopVariables(pauseInfo, key)];
    }

    if (selectedFrame) {
      const this_ = getThisVariable(selectedFrame, key);

      if (this_) {
        vars.push(this_);
      }
    }
  }

  return vars;
}

function synthesizeScopes(
  scope: Scope,
  selectedFrame: ?Frame,
  pauseInfo: ?Pause,
  scopeIndex: number,
  scopes
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
      selectedFrame,
      pauseInfo
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

function getScopeTitle(type, scope) {
  if (type === "function") {
    return scope.function.displayName
      ? simplifyDisplayName(scope.function.displayName)
      : L10N.getStr("anonymous");
  }
  return L10N.getStr("scopes.block");
}

function translateScope(
  scope: Scope,
  selectedFrame: ?Frame,
  pauseInfo: ?Pause,
  scopeIndex: number
): ?NamedValue {
  const { type, actor } = scope;

  const key = `${actor}-${scopeIndex}`;
  if (type === "function" || type === "block") {
    const bindings = scope.bindings;
    const sourceBindings = scope.sourceBindings;

    let vars = sourceBindings
      ? getSourceBindingVariables(bindings, sourceBindings, key)
      : getBindingVariables(bindings, key);

    // show exception, return, and this variables in innermost scope
    if (pauseInfo) {
      vars = vars.concat(getFramePopVariables(pauseInfo, key));
    }

    if (selectedFrame) {
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

export function getScopes(
  pauseInfo: Pause,
  selectedFrame: Frame,
  selectedScope: ?Scope
): ?(NamedValue[]) {
  if (!pauseInfo || !selectedFrame) {
    return null;
  }

  // NOTE: it's possible that we're inspecting an old server
  // that does not support getting frame scopes directly
  selectedScope = selectedScope || selectedFrame.scope;

  if (!selectedScope) {
    return null;
  }

  const scopes = [];

  let scope = selectedScope;
  let scopeIndex = 1;

  while (scope) {
    const { actor, syntheticScopes } = scope;
    let maybeSelectedFrame =
      actor === selectedScope.actor ? selectedFrame : null;
    let maybePauseInfo =
      actor === selectedScope.actor && selectedFrame.id === pauseInfo.frame.id
        ? pauseInfo
        : null;

    if (syntheticScopes) {
      const scopeDepth = syntheticScopes.groupLength;
      let lastScope = scope;
      // Scanning to check it scopes will contain pausedScopeActor or
      // selectedScope.actor actors.
      for (let i = 1; lastScope.parent && i < scopeDepth; i++) {
        const nextScope = lastScope.parent;
        if (!maybeSelectedFrame && nextScope.actor === selectedScope.actor) {
          maybeSelectedFrame = selectedFrame;
        }
        if (
          !maybePauseInfo &&
          nextScope.actor === selectedScope.actor &&
          selectedFrame.id === pauseInfo.frame.id
        ) {
          maybePauseInfo = pauseInfo;
        }
        lastScope = nextScope;
      }
      scopes.push(
        ...synthesizeScopes(
          scope,
          maybeSelectedFrame,
          maybePauseInfo,
          scopeIndex
        )
      );
      scope = lastScope;
      scopeIndex += syntheticScopes.scopes.length;
    } else {
      const translated = translateScope(
        scope,
        maybeSelectedFrame,
        maybePauseInfo,
        scopeIndex
      );
      if (translated) {
        scopes.push(translated);
      }
      scopeIndex++;
    }
    scope = scope.parent;
  }

  return scopes;
}
