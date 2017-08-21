import { getSymbols } from "../parser";
import { containsPosition } from "../parser/utils/helpers";

export async function getASTLocation(source, location) {
  const _source = source.toJS ? source.toJS() : source;
  const symbols = await getSymbols(_source);
  const functions = symbols.functions;

  const scope = functions.find(node => {
    return containsPosition(node.location, location);
  });
  if (scope) {
    const line = location.line - scope.location.start.line;
    const column = location.column;
    return { scope, offset: { line, column } };
  }
  return { scope: { name: undefined }, offset: location };
}

export async function findScopeByName(source, name) {
  const _source = source.toJS ? source.toJS() : source;
  const symbols = await getSymbols(_source);
  const functions = symbols.functions;

  return functions.find(node => {
    return node.name === name;
  });
}
