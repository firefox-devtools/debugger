/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import getSymbols from "./getSymbols";

export function isReactComponent(source) {
  const { imports, classes } = getSymbols(source);

  if (!imports || !classes) {
    return false;
  }

  return importsReact(imports) && extendsComponent(classes);
}

function importsReact(imports) {
  return imports.some(
    importObj =>
      importObj.source === "react" &&
      importObj.specifiers.some(specifier => specifier === "React")
  );
}

function extendsComponent(classes) {
  let result = false;
  classes.some(classObj => {
    if (
      classObj.parent.name === "Component" ||
      classObj.parent.name === "PureComponent"
    ) {
      result = true;
    }
  });

  return result;
}

export function isReduxAction(source) {
  const { functions } = getSymbols(source);

  if (!functions) {
    return false;
  }

  return containsAction(functions);
}

function containsAction(functions) {
  let result = false;

  functions.some(action => {
    if (!result && isAction(action)) {
      result = true;
    }
  });

  return result;
}

function isAction(action) {
  let result = false;

  if (action.body.type === "BlockStatement") {
    const innerBodies = action.body.body;
    innerBodies.some(innerBody => {
      if (!result && innerBody.type === "ReturnStatement") {
        const params = innerBody.argument.params;
        params.some(param => {
          const properties = param.properties;
          properties.some(property => {
            if (
              property.key.name === "dispatch" ||
              property.value.name === "dispatch"
            ) {
              result = true;
            }
          });
        });
      }
    });
  }

  return result;
}

export function isReduxReducer(source) {
  const { functions } = getSymbols(source);

  if (!functions) {
    return false;
  }

  return containsReducer(functions);
}

function containsReducer(functions) {
  return false;
}
