/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import getSymbols from "./getSymbols";

export function getFramework(sourceId) {
  if (isReactComponent(sourceId)) {
    return "React";
  }

  if (isAngularComponent(sourceId)) {
    return "Angular";
  }
}

// React

function isReactComponent(sourceId) {
  const { imports, classes, callExpressions } = getSymbols(sourceId);
  return (
    (importsReact(imports) || requiresReact(callExpressions)) &&
    extendsReactComponent(classes)
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

function extendsReactComponent(classes) {
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

// Angular

const isAngularComponent = sourceId => {
  const { memberExpressions, identifiers } = getSymbols(sourceId);
  return (
    identifiesAngular(identifiers) && hasAngularExpressions(memberExpressions)
  );
};

const identifiesAngular = identifiers => {
  return identifiers.some(item => item.name == "angular");
};

const hasAngularExpressions = memberExpressions => {
  return memberExpressions.some(
    item => item.name == "controller" || item.name == "module"
  );
};
