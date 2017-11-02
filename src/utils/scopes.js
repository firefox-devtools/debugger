// @flow

import { toPairs } from "lodash";
import { get } from "lodash";
import { simplifyDisplayName } from "./frame";
import type { Frame, Pause, Scope, BindingContents } from "debugger-html";

export type NamedValue = {
  name: string,
  generatedName?: string,
  path: string,
  contents: BindingContents | NamedValue[]
};

// VarAndBindingsPair actually is [name: string, contents: ScopeBindings]
type VarAndBindingsPair = Array<any>;
type VarAndBindingsPairs = Array<VarAndBindingsPair>;

// Create the tree nodes representing all the variables and arguments
// for the bindings from a scope.
function getBindingVariables(bindings, parentName) {
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
) {
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

export function getSpecialVariables(pauseInfo: Pause, path: string) {
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

function getThisVariable(frame: any, path: string) {
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

  do {
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
      if (scope.actor === pausedScopeActor) {
        vars = vars.concat(getSpecialVariables(pauseInfo, key));
      }

      if (scope.actor === selectedScope.actor) {
        const this_ = getThisVariable(selectedFrame, key);

        if (this_) {
          vars.push(this_);
        }
      }

      if (vars && vars.length) {
        vars.sort((a, b) => a.name.localeCompare(b.name));
        scopes.push({
          name: title,
          path: key,
          contents: vars
        });
      }
    } else if (type === "object") {
      let value = scope.object;
      // If this is the global window scope, mark it as such so that it will
      // preview Window: Global instead of Window: Window
      if (value.class === "Window") {
        value = Object.assign({}, scope.object, { displayClass: "Global" });
      }
      scopes.push({
        name: scope.object.class,
        path: key,
        contents: { value }
      });
    }
    scopeIndex++;
  } while ((scope = scope.parent)); // eslint-disable-line no-cond-assign

  return scopes;
}
