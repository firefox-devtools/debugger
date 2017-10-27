import getSymbols from "./getSymbols";

export function isReactComponent(source) {
  const { imports, classes } = getSymbols(source);

  if (!imports || !classes) {
    return false;
  }

  return importsReact(imports) && extendsComponent(classes);
}

function importsReact(imports) {
  let result = false;

  imports.some(importObj => {
    if (importObj.source === "react") {
      importObj.specifiers.some(specifier => {
        if (specifier.local.name === "React") {
          result = true;
        }
      });
    }
  });

  return result;
}

function extendsComponent(classes) {
  let result = false;
  classes.some(classObj => {
    if (classObj.parent.name === "Component") {
      result = true;
    }
  });

  return result;
}
