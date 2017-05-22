// @flow

import toPairs from "lodash/toPairs";
const get = require("lodash/get");

import type { Frame, Pause } from "debugger-html";

type ScopeData = {
  name: string,
  path: string,
  contents: Object[] | Object
};

// Create the tree nodes representing all the variables and arguments
// for the bindings from a scope.
function getBindingVariables(bindings, parentName) {
  const args = bindings.arguments.map(arg => toPairs(arg)[0]);
  const variables = toPairs(bindings.variables);

  return args.concat(variables).map(binding => ({
    name: binding[0],
    path: `${parentName}/${binding[0]}`,
    contents: binding[1]
  }));
}

export function getSpecialVariables(pauseInfo: Pause, path: string) {
  let thrown = get(pauseInfo, "why.frameFinished.throw", undefined);

  let returned = get(pauseInfo, "why.frameFinished.return", undefined);

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
  selectedFrame: Frame
): ?(ScopeData[]) {
  if (!pauseInfo || !selectedFrame) {
    return null;
  }

  let selectedScope = selectedFrame.scope;

  if (!selectedScope) {
    return null;
  }

  const scopes = [];

  let scope = selectedScope;
  let pausedScopeActor = get(pauseInfo, "frame.scope.actor");
  let scopeIndex = 1;

  do {
    const { type, actor } = scope;
    const key = `${actor}-${scopeIndex}`;
    if (type === "function" || type === "block") {
      const bindings = scope.bindings;
      let title;
      if (type === "function") {
        title = scope.function.displayName || "(anonymous)";
      } else {
        title = L10N.getStr("scopes.block");
      }

      let vars = getBindingVariables(bindings, key);

      // show exception, return, and this variables in innermost scope
      if (scope.actor === pausedScopeActor) {
        vars = vars.concat(getSpecialVariables(pauseInfo, key));
      }

      if (scope.actor === selectedScope.actor) {
        let this_ = getThisVariable(selectedFrame, key);

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

/**
 * Returns variables that are visible from this scope.
 * TODO: returns global variables as well
 */
export function getVisibleVariablesFromScope(
  pauseInfo: Pause,
  selectedFrame: Frame
) {
  const result = new Map();

  const scopes = getScopes(pauseInfo, selectedFrame);
  if (!scopes) {
    return result;
  }

  // reverse so that the local variables shadow global variables
  let scopeContents = scopes.reverse().map(scope => scope.contents);
  scopeContents = [].concat(...scopeContents);

  scopeContents.forEach(content => {
    result.set(content.name || null, content);
  });

  return result;
}
