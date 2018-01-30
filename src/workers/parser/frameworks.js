/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import getSymbols from "./getSymbols";

export function isReactComponent(sourceId) {
  const { imports, classes, callExpressions } = getSymbols(sourceId);
  return (
    (importsReact(imports) || requiresReact(callExpressions)) &&
    extendsComponent(classes)
  );
}

function importsReact(imports) {
  return imports.some(
    importObj =>
      importObj.source === "react" &&
      importObj.specifiers.some(specifier => specifier === "React")
  );
}

function requiresReact(callExpressions) {
  return callExpressions.some(
    callExpression =>
      callExpression.name === "require" &&
      callExpression.values.some(value => value === "react")
  );
}

function extendsComponent(classes) {
  let result = false;
  classes.some(classObj => {
    if (
      classObj.parent.name === "Component" ||
      classObj.parent.name === "PureComponent" ||
      classObj.parent.property.name === "Component"
    ) {
      result = true;
    }
  });

  return result;
}
