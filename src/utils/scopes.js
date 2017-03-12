// @flow

import toPairs from "lodash/toPairs";

// Create the tree nodes representing all the variables and arguments
// for the bindings from a scope.
function getBindingVariables(bindings, parentName) {
  const args = bindings.arguments.map(arg => toPairs(arg)[0]);
  const variables = toPairs(bindings.variables);

  return args.concat(variables)
    .map(binding => ({
      name: binding[0],
      path: `${parentName}/${binding[0]}`,
      contents: binding[1]
    }));
}

// Support dehydrating immutable objects, while ignoring
// primitive values like strings, numbers...
function dehydrateValue(value) {
  if (typeof value == "object" && !!value && value.toJS) {
    value = value.toJS();
  }

  return value;
}

function getSpecialVariables(pauseInfo, path) {
  let thrown = pauseInfo.getIn(
    ["why", "frameFinished", "throw"],
    undefined
  );

  let returned = pauseInfo.getIn(
    ["why", "frameFinished", "return"],
    undefined
  );

  const vars = [];

  if (thrown !== undefined) {
    thrown = dehydrateValue(thrown);
    vars.push({
      name: "<exception>",
      path: `${path}/<exception>`,
      contents: { value: thrown }
    });
  }

  if (returned !== undefined) {
    returned = dehydrateValue(returned);

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

function getThisVariable(frame, path) {
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

function getScopes(pauseInfo, selectedFrame) {
  if (!pauseInfo || !selectedFrame) {
    return null;
  }

  let selectedScope = selectedFrame.scope;

  if (!selectedScope) {
    return null;
  }

  const scopes = [];

  let scope = selectedScope;
  let pausedScopeActor = pauseInfo.getIn(["frame", "scope"]).get("actor");

  do {
    const type = scope.type;
    const key = scope.actor;
    if (type === "function" || type === "block") {
      const bindings = scope.bindings;
      let title;
      if (type === "function") {
        title = scope.function.displayName || "(anonymous)";
      } else {
        title = L10N.getStr("scopes.block");
      }

      let vars = getBindingVariables(bindings, title);

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
        scopes.push({ name: title, path: key, contents: vars });
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
  } while (scope = scope.parent); // eslint-disable-line no-cond-assign

  return scopes;
}

module.exports = {
  getScopes,
  getSpecialVariables
};
