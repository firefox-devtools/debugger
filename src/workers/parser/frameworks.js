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
