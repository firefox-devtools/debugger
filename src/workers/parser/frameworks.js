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
    if (classObj.parent.name === "Component") {
      result = true;
    }
  });

  return result;
}
