// @flow

import { toPairs } from "lodash";
import { get } from "lodash";
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

export function getSpecialVariables(
  pauseInfo: Pause,
  path: string
): NamedValue[] {
  const thrown = get(pauseInfo, "why.frameFinished.throw", undefined);

  const returned = get(pauseInfo, "why.frameFinished.return", undefined);

  const vars = [];

  if (thrown !== undefined) {
    vars.push({
      name: "<exception>",
      path: `${path}/<exception>`,
      contents: { value: thrown }
    });
  }

  if (returned !== undefined) {
    // Do not display a return value of "undefined",
    if (!returned || !returned.type || returned.type !== "undefined") {
      vars.push({
        name: "<return>",
        path: `${path}/<return>`,
        contents: { value: returned }
      });
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

type SynthesizeScopeContext = {
  actor: string,
  scopeIndex: number,
  lastScopeIndex: number,
  generatedScopes: Scope[],
  foundGeneratedNames: { [name: string]: boolean },
  selectedFrame: ?Frame,
  pauseInfo: ?Pause,
  result: NamedValue[]
};

// Create a synthesized scope based on its binding names and
// generated/original scopes information.
function synthesizeScope(
  acc: SynthesizeScopeContext,
  syntheticScope: SyntheticScope,
  index: number
): SynthesizeScopeContext {
  const {
    actor,
    scopeIndex,
    lastScopeIndex,
    generatedScopes,
    foundGeneratedNames,
    selectedFrame,
    pauseInfo,
    result
  } = acc;
  const { type, bindingsNames, sourceBindings } = syntheticScope;
  const key = `${actor}-${scopeIndex + index}`;
  const isLast = index === lastScopeIndex;

  let title;
  if (type === "function") {
    // FIXME Use original function name here
    const lastGeneratedScope = generatedScopes[generatedScopes.length - 1];
    const isLastGeneratedScopeFn =
      lastGeneratedScope && lastGeneratedScope.type === "function";
    title =
      isLastGeneratedScopeFn && lastGeneratedScope.function.displayName
        ? simplifyDisplayName(lastGeneratedScope.function.displayName)
        : L10N.getStr("anonymous");
  } else {
    title = L10N.getStr("scopes.block");
  }

  let vars = [];
  bindingsNames.forEach(name => {
    let generatedName, generatedScope;
    if (sourceBindings) {
      generatedName = sourceBindings[name];
      generatedScope = generatedScopes.find(
        ({ bindings }) =>
          bindings &&
          (generatedName in bindings.variables ||
            bindings.arguments.some(arg => generatedName in arg))
      );
      if (!generatedScope) {
        return;
      }
    } else {
      // Find binding name in the original source bindings
      generatedScope = generatedScopes.find(
        gs => gs.sourceBindings && name in gs.sourceBindings
      );
      if (!generatedScope || !generatedScope.sourceBindings) {
        return;
      }
      // .. and map it to the generated name
      generatedName = generatedScope.sourceBindings[name];
    }
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
        return;
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
        return;
      }
    }

    vars.push({
      name,
      generatedName,
      path: `${key}/${generatedName}`,
      contents: { value: { type: "undefined" } }
    });
  });

  if (isLast) {
    // For the last synthesized scope, apply all generated names we did not use
    const allGeneratedVars = generatedScopes.reduce((acc_, { bindings }) => {
      return acc_.concat(getBindingVariables(bindings, key));
    }, []);
    vars = vars.concat(
      allGeneratedVars.filter(v => !foundGeneratedNames[v.name])
    );
  }

  if (index === 0) {
    // For the first synthesized scope, add this and other vars.
    if (pauseInfo) {
      vars = vars.concat(getSpecialVariables(pauseInfo, key));
    }

    if (selectedFrame) {
      const this_ = getThisVariable(selectedFrame, key);

      if (this_) {
        vars.push(this_);
      }
    }
  }

  if (vars && vars.length) {
    vars.sort((a, b) => a.name.localeCompare(b.name));
    result.push({
      name: title,
      path: key,
      contents: vars
    });
  }
  return acc;
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

  const { result } = syntheticScopes.scopes.reduce(synthesizeScope, {
    actor,
    scopeIndex,
    lastScopeIndex: syntheticScopes.scopes.length - 1,
    generatedScopes,
    foundGeneratedNames: Object.create(null),
    selectedFrame,
    pauseInfo,
    result: []
  });
  return result;
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
    let title;
    if (type === "function") {
      title = scope.function.displayName
        ? simplifyDisplayName(scope.function.displayName)
        : L10N.getStr("anonymous");
    } else {
      title = L10N.getStr("scopes.block");
    }

    let vars = sourceBindings
      ? getSourceBindingVariables(bindings, sourceBindings, key)
      : getBindingVariables(bindings, key);

    // show exception, return, and this variables in innermost scope
    if (pauseInfo) {
      vars = vars.concat(getSpecialVariables(pauseInfo, key));
    }

    if (selectedFrame) {
      const this_ = getThisVariable(selectedFrame, key);

      if (this_) {
        vars.push(this_);
      }
    }

    if (vars && vars.length) {
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
      value = Object.assign({}, scope.object, { displayClass: "Global" });
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
  const pausedScopeActor = get(pauseInfo, "frame.scope.actor");
  let scopeIndex = 1;

  while (scope) {
    const { actor, syntheticScopes } = scope;
    let maybeSelectedFrame =
      actor === selectedScope.actor ? selectedFrame : null;
    let maybePauseInfo = actor === pausedScopeActor ? pauseInfo : null;

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
        if (!maybePauseInfo && nextScope.actor === pausedScopeActor) {
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
